# Suno API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Suno API is a lightweight and awesome TypeScript client library for interacting with the [Suno.com](https://suno.com) service. It allows you to generate audio clips, extend existing clips, concatenate audio segments, and produce lyrics programmatically. This version is intended for use in your own projects, providing an open-source solution while the official API is still in development.

**IMPORTANT:** This project is an **unofficial** API client for [suno.com](https://suno.com). It is not affiliated with, endorsed by, or sponsored by suno.com in any way. Use this library responsibly and in accordance with suno.com's [Terms of Service](https://suno.com/terms) and relevant laws. I am not responsible for any issues that arise from using this library. If you encounter any problems or have concerns, please contact suno.com directly.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Generating Clips](#generating-clips)
  - [Extending Clips](#extending-clips)
  - [Generating Lyrics](#generating-lyrics)
  - [Retrieving Information](#retrieving-information)
- [Advanced Usage](#advanced-usage)
  - [Generating Clips with Suno-Generated Lyrics](#generating-clips-with-suno-generated-lyrics)
  - [Generating Clips with OpenAI-Generated Lyrics](#generating-clips-with-openai-generated-lyrics)
- [Scripts](#scripts)
- [License](#license)

## Introduction

[Suno.com](https://suno.com) is an awesome AI-powered music service that revolutionizes the way you create and manipulate audio content. With its cutting-edge artificial intelligence, Suno.com enables users to effortlessly generate high-quality audio clips, enhance existing tracks, and craft compelling lyrics. Although the official API from Suno.com is not yet available, we couldn't wait to bring its incredible capabilities to developers. Recognizing the shared needs of many users, we open-sourced this project to help you integrate Suno.com's features into your own applications seamlessly.

**Note:** This version of Suno API is fully intended for use in your own projects, providing you with the tools to leverage Suno.com's functionalities even before the official API launch.

## Getting Started

### 1. Obtain Your Suno.ai Session Cookie

To use Suno API, you need to obtain the session cookie from your [suno.com/create](https://suno.com/create) account:

1. **Visit Suno.ai**: Open [suno.com/create](https://suno.com/create) in your browser.
2. **Open Developer Tools**: Press `F12` or right-click and select **Inspect**.
3. **Go to Network Tab**: Click on the **Network** tab.
4. **Refresh the Page**: Reload the page to capture network requests.
5. **Find the Request**: Look for a request containing `client?_clerk_js_version` in the URL.
6. **Copy Cookie Value**:
   - Click on the request.
   - Navigate to the **Headers** section.
   - Locate the **Cookie** field and copy its value.

> **Security Reminder:** Keep your session cookie confidential. Do not share it or expose it in client-side code.

## Installation

Suno API can be installed using **npm**, **Yarn**, or **pnpm**. Choose the package manager that best fits your project.

### Using npm

```bash
npm install suno-api
```

### Using Yarn

```bash
yarn add suno-api
```

### Using pnpm

```bash
pnpm add suno-api
```

## Usage

### Initialization

Import and initialize the `Api` class with your Suno session cookie.

```typescript
import { Api } from 'suno-api';

// Replace with your actual SUNO_COOKIE
const SUNO_COOKIE = 'your_suno_cookie_here';

const sunoApi = new Api(SUNO_COOKIE);
```

### Generating Clips

Generate new audio clips by providing the necessary payload and optional generation options.

#### Simple Usage
```typescript
import { IGenerateClipPayload } from 'suno-api';

const payload: IGenerateClipPayload = {
  prompt: 'A relaxing acoustic guitar melody with soothing vocals.', // **Required:** Description of the desired audio clip.
  makeInstrumental: true, // **Optional:** Default is `false`. Set to `true` to generate an instrumental version.
  tags: 'acoustic,relaxing,vocals', // **Optional:** Comma-separated styles or genres for the clip.
  title: 'My Awesome Song', // **Optional:** Title of the generated clip.
};

const clips = await sunoApi.generateClips(payload);
console.log('Generated Clips:', clips);
```

#### Usage with Options

```typescript
import { IGenerateClipPayload, IGenerateOptions, Status } from 'suno-api';

const payload: IGenerateClipPayload = {
  prompt: 'A relaxing acoustic guitar melody with soothing vocals.', // **Required:** Description of the desired audio clip.
  makeInstrumental: true, // **Optional:** Default is `false`. Set to `true` to generate an instrumental version.
  tags: 'acoustic,relaxing,vocals', // **Optional:** Comma-separated styles or genres for the clip.
  title: 'My Awesome Song', // **Optional:** Title of the generated clip.
};

const options: IGenerateOptions = {
  wait: true, // **Optional:** Whether to wait for the generation to complete. Default is `true`.
  waitStatuses: [Status.COMPLETE, Status.STREAMING], // **Optional:** Statuses to wait for before resolving. Default is `['COMPLETE']`.
  waitTimeout: 300000, // **Optional:** Maximum time to wait in milliseconds. Default is `600000` (10 minutes).
  waitSleepRange: [5, 10], // **Optional:** Sleep interval range in seconds between status checks. Default is `[10, 20]`.
};

const clips = await sunoApi.generateClips(payload, options);
console.log('Generated Clips:', clips);
```


### Extending Clips

Extend an existing audio clip by providing additional content and optional generation options.

#### Simple Usage
```typescript
import { IGenerateClipExtendPayload } from 'suno-api';

const extendPayload: IGenerateClipExtendPayload = {
  prompt: 'Add a drum beat to enhance the rhythm.', // **Required:** Description of the additional content.
  continueClipId: 'existing_clip_id', // **Required:** The ID of the audio clip to extend.
  continueAt: '00:30', // **Optional:** Extend the clip from the specified timestamp (mm:ss). Defaults to the end of the song.
  makeInstrumental: false, // **Optional:** Default is `false`. Set to `true` if you want the extended clip to be instrumental.
  tags: 'drum,enhance,rhythm', // **Optional:** Comma-separated styles or genres for the extended clip.
  title: 'Extended Drum Beat', // **Optional:** Title of the extended clip.
};

const extendedClip = await sunoApi.extendClip(extendPayload);
console.log('Extended Clip:', extendedClip);
```

#### Usage with Options
```typescript
import { IGenerateClipExtendPayload, IGenerateOptions, Status } from 'suno-api';

const extendPayload: IGenerateClipExtendPayload = {
  prompt: 'Add a drum beat to enhance the rhythm.', // **Required:** Description of the additional content.
  continueClipId: 'existing_clip_id', // **Required:** The ID of the audio clip to extend.
  continueAt: '00:30', // **Optional:** Extend the clip from the specified timestamp (mm:ss). Defaults to the end of the song.
  makeInstrumental: false, // **Optional:** Default is `false`. Set to `true` if you want the extended clip to be instrumental.
  tags: 'drum,enhance,rhythm', // **Optional:** Comma-separated styles or genres for the extended clip.
  title: 'Extended Drum Beat', // **Optional:** Title of the extended clip.
};

const options: IGenerateOptions = {
  wait: true,
  waitStatuses: [Status.STREAMING, Status.COMPLETE],
  waitTimeout: 300000,
  waitSleepRange: [5, 10],
};

const extendedClip = await sunoApi.extendClip(extendPayload, options);
console.log('Extended Clip:', extendedClip);
```



### Generating Lyrics

Generate lyrics based on a custom prompt and optional generation options.

#### Simple Usage
```typescript
import { IGenerateLyricsPayload } from 'suno-api';

const payload: IGenerateLyricsPayload = {
  prompt: 'Write lyrics about a summer night by the beach.', // **Required:** Description or theme for the lyrics.
};

const lyrics = await sunoApi.generateLyrics(payload);
console.log('Generated Lyrics:', lyrics);
```

#### Usage with Options
```typescript
import { IGenerateLyricsPayload, IGenerateOptions, Status } from 'suno-api';

const payload: IGenerateLyricsPayload = {
  prompt: 'Write lyrics about a summer night by the beach.', // **Required:** Description or theme for the lyrics.
};

const options: IGenerateOptions = {
  wait: true, // **Optional:** Whether to wait for the generation to complete. Default is `true`.
  waitStatuses: [Status.COMPLETE], // **Optional:** Statuses to wait for before resolving. Default is `['COMPLETE']`.
  waitTimeout: 600000, // **Optional:** Maximum time to wait in milliseconds. Default is `600000` (10 minutes).
  waitSleepRange: [2, 5], // **Optional:** Sleep interval range in seconds between status checks. Default is `[10, 20]`.
};

const lyrics = await sunoApi.generateLyrics(payload, options);
console.log('Generated Lyrics:', lyrics);
```

### Retrieving Information

Fetch information about generated lyrics, clips, or billing without wrapping them in functions.

```typescript
import { IClip, ILyrics } from 'suno-api';

// Get Lyrics by ID
const lyricsId = 'generated_lyrics_id'; // **Required:** The ID of the generated lyrics.
const lyrics: ILyrics = await sunoApi.getLyrics(lyricsId);
console.log('Lyrics Info:', lyrics);

// Get Clip by ID
const clipId = 'clip_id'; // **Required:** The ID of the audio clip.
const clip: IClip = await sunoApi.getClip(clipId);
console.log('Clip Info:', clip);

// Get Billing Information
const billingInfo = await sunoApi.getBillingInfo();
console.log('Billing Info:', billingInfo);
```

## Advanced Usage

### Generating Clips with Suno-Generated Lyrics

Generate audio clips using lyrics generated by Suno's native lyrics generation API.

```typescript
import { Api, IGenerateClipPayload, IClip, ILyrics } from 'suno-api';

// Initialize Suno API
const sunoApi = new Api('your_suno_cookie_here');

// Generate lyrics using Suno's API
const lyricsPayload: IGenerateLyricsPayload = {
  prompt: 'Write lyrics about a summer night by the beach.',
};

const lyrics: ILyrics = await sunoApi.generateLyrics(lyricsPayload);

// Define computed payload
const payload: IGenerateClipPayload = {
  prompt: lyrics.text,
  title: lyrics.title,
  tags: 'uplifting, harmonious, vocals',
};

// Generate clips
const clips: IClip[] = await sunoApi.generateClips(payload);
console.log('Generated Clips:', clips);
```

### Generating Clips with OpenAI-Generated Lyrics

Enhance lyrics generation by integrating with OpenAI for more sophisticated processing.

```typescript
import { Api, IGenerateClipPayload, IGenerateOptions, IClip, Status } from 'suno-api';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Runnable } from '@langchain/core/runnables';
import { ChatPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

// Initialize Suno API
const sunoApi = new Api('your_suno_cookie_here');

// Initialize OpenAI Chat Model
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  // here is your magic coming. Usually, 0 is good also
  temperature: 0.5,
});

const SYSTEM_LYRICS_PROMPT = `
Create a song using the original language inferred from the context. Only generate the lyrics—no explanations or descriptions.

Context: {context}

Style Tags: {tags}
Song title: {title}

Follow this structure:
- [Verse]
- [Chorus]
- [Verse 2]
- [Chorus]
- [Bridge]
- [Chorus]
`
// Prepare the LLM lyrics chain
const lyricsChain: Runnable<any, string> = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_LYRICS_PROMPT),
])
  .pipe(llm)
  .pipe(new StringOutputParser());

// Define payload
const payload: Pick<IGenerateClipPayload, 'tags' | 'title'> = {
  tags: 'trance, electronic, male, psyhodelic',
  title: 'Everything will be ok',
};

// Generate lyrics using OpenAI
const prompt = await lyricsChain.invoke({
    context: 'The author of this package is looking for a job, but companies reject him bc he is overqualified.',
    ...payload,
  }),


// Generate clips
const clips: IClip[] = await sunoApi.generateClips({
  ...payload,
  prompt,
});

console.log('Generated Clips:', clips);

// log template : `Generated[${clip.displayName}]: ${clip.title} ${clip.audioUrl} [${clip.status}]`

// Generated[Anton IT]: Everything will be ok https://cdn1.suno.ai/45f9a666-d815-4736-a36c-25de576839fa.mp3 [complete]
// Generated[Anton IT]: Everything will be ok https://cdn1.suno.ai/b82044e2-ed18-47f8-ab3e-4d6717562d6e.mp3 [complete]
```


## Scripts

Available scripts for development and maintenance:

- **Build**: Compiles the TypeScript code and bundles the library.
  ```bash
  pnpm run build
  ```
- **Format**: Formats the codebase using Prettier.
  ```bash
  pnpm run format
  ```
- **Lint**: Analyzes the code for linting errors using ESLint.
  ```bash
  pnpm run lint
  ```
- **Test**: Runs the test suite using Jest.
  ```bash
  pnpm run test
  ```

## License

This project is licensed under the [MIT License](LICENSE).

**IMPORTANT:** This project is an **unofficial** API client for [suno.com](https://suno.com). It is not affiliated with, endorsed by, or sponsored by suno.com in any way. Use this library responsibly and in accordance with suno.com's [Terms of Service](https://suno.com/terms) and relevant laws. I am not responsible for any issues that arise from using this library. If you encounter any problems or have concerns, please contact suno.com directly.
