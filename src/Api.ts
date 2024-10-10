import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import UserAgent from 'user-agents'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { camelcaseKeys } from './utils/camelcaseKeys'
import { snakecaseKeys } from './utils/snakecaseKeys'
import { ILyrics } from './contracts/ILyrics'
import { IClip } from './contracts/IClip'
import { API_BASE_URL, CLERK_API_BASE_URL, CLERK_JS_VERSION, DEFAULT_MODEL } from './constants'
import { Status } from './enums/Status'
import { sleep } from './utils/sleep'
import { IPayload as IGenerateClipPayload } from './contracts/generate/clip/IPayload'
import { IPayload as IGenerateClipExtendPayload } from './contracts/generate/clip/extend/IPayload'
import { IOptions as IGenerateOptions } from './contracts/generate/IOptions'
import { IPayload as IGenerateLyricsPayload } from './contracts/generate/lyrics/IPayload'
import { parse } from './utils/lyrics/parse'

export const DEFAULT_AXIOS_TIMEOUT = 10000

export class Api {
  protected readonly clerkClient: AxiosInstance
  protected readonly apiClient: AxiosInstance
  private accessToken?: string

  constructor(cookie: string) {
    const randomUserAgent = new UserAgent(/Chrome/).random().toString()
    this.clerkClient = wrapper(
      axios.create({
        baseURL: CLERK_API_BASE_URL,
        jar: new CookieJar(),
        withCredentials: true,
        timeout: DEFAULT_AXIOS_TIMEOUT,
        headers: {
          'User-Agent': randomUserAgent,
          Cookie: cookie,
        },
      }),
    )

    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      timeout: DEFAULT_AXIOS_TIMEOUT,
      headers: {
        'User-Agent': randomUserAgent,
      },
    })
    this.apiClient.interceptors.request.use((config) => {
      if (this.accessToken) {
        // Use the current token status
        config.headers['Authorization'] = `Bearer ${this.accessToken}`
      }
      return config
    })
    // reauthentication
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
          try {
            await this.authenticate()
            return await this.apiClient.request(error.response.config)
          } catch (e) {
            return Promise.reject(e)
          }
        }
        return Promise.reject(error)
      },
    )
    const snakecasing = (config: any) => {
      // Check if there is data in the request and convert its keys to snake_case
      if (config.data) {
        config.data = snakecaseKeys(config.data)
      }

      // Check if there are params and convert its keys to snake_case
      if (config.params) {
        config.params = snakecaseKeys(config.params)
      }

      return config
    }
    // Add a request interceptor to convert camelCase to snake_case
    this.apiClient.interceptors.request.use(snakecasing)
    this.clerkClient.interceptors.request.use(snakecasing)

    const camelcasing = (response: AxiosResponse) => {
      // Convert all snake_case keys to camelCase in response data
      if (response.data) {
        response.data = camelcaseKeys(response.data)
      }
      return response
    }
    // Add a response interceptor to camelize everything
    this.apiClient.interceptors.response.use(camelcasing)
    this.clerkClient.interceptors.response.use(camelcasing)

    this.apiClient.interceptors.response.use((response) => {
      // If status code is 200, return the response as is
      if (response.status === 200) {
        return response
      }
      // Throw an error if status code is not 200
      return Promise.reject(new Error(`Unexpected status code[${response.status}]: ${response.statusText}`))
    })
  }

  /**
   * Authenticates suno by cookie
   *
   * @param emulateDelay Emulates 1-2 seconds delay since it is a reverse enginiered version
   *
   * @returns void
   */
  async authenticate(emulateDelay = false): Promise<void> {
    // Get session ID
    const data = (await this.clerkClient.get(`?_clerk_js_version=${CLERK_JS_VERSION}`)).data
    if (data?.response?.lastActiveSessionId === undefined) {
      throw new Error('Failed to get session id, you may need to update the SUNO_COOKIE')
    }
    // Renew session token with URL to renew session token
    const { jwt } = (
      await this.clerkClient.post(
        `/sessions/${data.response.lastActiveSessionId}/tokens?_clerk_js_version=${CLERK_JS_VERSION}`,
      )
    ).data
    // Update Authorization field in request header with the new JWT token
    this.accessToken = jwt
    // emualte delay
    if (emulateDelay) {
      await sleep(1, 2)
    }
  }

  /**
   * Waits the generation by checking callback result based on wait options
   *
   * @param callback  Returns latest result
   * @param options IGenrationOptions The options included configuration for the wait logic
   * @param noWaitResult The result if no need to wait
   * @returns A promise that resolves the latest generated result.
   */
  protected async waitGeneration<T extends { status: Status } | { status: Status }[]>(
    callback: () => Promise<T>,
    options: Pick<IGenerateOptions, 'wait' | 'waitStatuses' | 'waitTimeout' | 'waitSleepRange'>,
    noWaitResult: T,
  ): Promise<T> {
    if (!options.wait) {
      return noWaitResult
    }

    //Want to wait for music file generation
    const startTime = Date.now()
    let lastResult!: T
    const [waitSleepRangeMin, waitSleepRangeMax] = options.waitSleepRange || [10, 20]
    await sleep(waitSleepRangeMin, waitSleepRangeMax)

    const waitTimeout = options.waitTimeout || 600000
    const waitStatuses = options.waitStatuses || [Status.STREAMING, Status.COMPLETE]

    while (Date.now() - startTime < waitTimeout) {
      const result: T = await callback()
      const results = !Array.isArray(result) ? [result] : result
      const isAllCompleted = results.every(({ status }) => waitStatuses.includes(status))
      const isAllError = results.every(({ status }) => status === Status.ERROR)
      if (isAllCompleted || isAllError) {
        return result
      }
      lastResult = result
      await sleep(waitSleepRangeMin, waitSleepRangeMax)
    }
    return lastResult
  }

  /**
   * Generates songs/clips based on the provided parameters.
   *
   * @param IGenerateClipPayload The payload to generate songs/clips from.
   * @param IGenerateOptions The optins to generate songs/clips.
   *
   * @returns A promise that resolves to an array of AudioInfo objects representing the generated songs.
   */
  async generateClips(
    payload: IGenerateClipPayload,
    options: IGenerateOptions = {
      wait: true,
      waitStatuses: [Status.COMPLETE],
      waitSleepRange: [10, 20],
    },
  ): Promise<IClip[]> {
    const { clips } = (
      await this.apiClient.post(`/generate/v2/`, {
        // defaults
        mv: DEFAULT_MODEL,
        makeInstrumental: false,
        // override with payload
        ...payload,
        // some additional post tricks
        ...(payload.tags && payload.title
          ? {}
          : // if tags and title are not provided, then put prompt into gptDescriptionPrompt
            { gptDescriptionPrompt: prompt }),
      })
    ).data

    const ids = clips.map(({ id }: IClip) => id).join(',')

    return await this.waitGeneration<IClip[]>(this.getFeed.bind(this, { ids }), options, clips)
  }

  /**
   * Extends an existing audio clip by generating additional content based on the provided prompt.
   *
   * @param IGenerateClipExtendPayload The payload to generate songs/clips from.
   * @param IGenerateOptions The optins to generate songs/clips.
   * @returns A promise that resolves to an AudioInfo object representing the extended audio clip.
   */
  async extendClip(
    payload: IGenerateClipExtendPayload,
    options: IGenerateOptions = {
      wait: true,
      waitStatuses: [Status.STREAMING, Status.COMPLETE],
      waitSleepRange: [10, 20],
    },
  ): Promise<IClip> {
    const clip: IClip = (await this.apiClient.post(`/generate/v2/`, payload)).data
    // wait until clip is ready
    return await this.waitGeneration(this.getClip.bind(this, clip.id), options, clip)
  }

  /**
   * Calls the concatenate endpoint for a clip to generate the whole song.
   * @param clipId The ID of the audio clip to concatenate.
   * @returns A promise that resolves to an AudioInfo object representing the concatenated audio.
   * @throws Error if the response status is not 200.
   */
  public async concatenate(clipId: string): Promise<IClip> {
    return (
      await this.apiClient.post(`/generate/concat/v2/`, {
        clipId,
      })
    ).data
  }

  /**
   * Generates lyrics based on a given prompt.
   *
   * @param payload IGenerateLyricsPayload The payload to generate lyrics.
   * @returnsThe generated lyrics object.
   */
  public async generateLyrics(
    payload: IGenerateLyricsPayload,
    options: IGenerateOptions = {
      wait: true,
      waitStatuses: [Status.COMPLETE],
      waitSleepRange: [2, 5],
    },
  ): Promise<ILyrics> {
    // Initiate lyrics generation
    const { id } = (await this.apiClient.post(`/generate/lyrics/`, payload)).data
    // wait until done
    return await this.waitGeneration<ILyrics>(this.getLyrics.bind(this, id), options, {
      id,
      text: 'Can not generate lyrics',
      title: '',
      status: Status.ERROR,
    })
  }

  /**
   * Retrieves information for a specific lyrics.
   * @param id The ID of the audio lirycs to retrieve information for.
   * @returns A promise that resolves to an object containing the audio lyrics information.
   */
  public async getLyrics(id: string): Promise<ILyrics> {
    const lyrics: Omit<ILyrics, 'id'> = (await this.apiClient.get(`/generate/lyrics/${id}`)).data
    // bad api practice to return partial data without id, so, let's extend this logic and also let's improve text
    return {
      id,
      ...lyrics,
      text: parse(lyrics.text || ''),
    }
  }

  /**
   * Retrieves audio information for the given song IDs.
   * @param songIds An optional array of song IDs to retrieve information for.
   * @returns A promise that resolves to an array of AudioInfo objects.
   */
  public async getFeed(params: { ids?: string }): Promise<IClip[]> {
    return (await this.apiClient.get(`/feed/v2`, { params })).data
  }

  /**
   * Retrieves information for a specific audio clip.
   * @param clipId The ID of the audio clip to retrieve information for.
   * @returns A promise that resolves to an object containing the audio clip information.
   */
  public async getClip(id: string): Promise<IClip> {
    return (await this.apiClient.get(`/clip/${id}`)).data
  }

  /**
   * Retrieves information about available credits and plans.
   * @returns A promise that resolves to an object containing the credits information.
   */
  public async getBillingInfo(): Promise<any> {
    return (await this.apiClient.get(`/billing/info/`)).data
  }
}
