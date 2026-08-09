const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const MODEL = 'gemini-flash-latest'

const GENERATE_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const FILE_UPLOAD_ENDPOINT =
  'https://generativelanguage.googleapis.com/upload/v1beta/files'

const MAX_IMAGE_SIZE = 20 * 1024 * 1024
const MAX_FILE_SIZE = 50 * 1024 * 1024

function getApiKey() {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_GEMINI_API_KEY — add it to your .env.local file.'
    )
  }

  return API_KEY
}

/* -------------------------------------------------------
   Gemini generateContent request
------------------------------------------------------- */

async function callGemini(contents, { json = false } = {}) {
  const apiKey = getApiKey()

  const body = {
    contents,
    ...(json
      ? {
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }
      : {}),
  }

  const response = await fetch(GENERATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    const message =
      errorData?.error?.message ||
      `Gemini request failed (${response.status})`

    if (response.status === 429) {
      throw new Error(
        `Rate limited — please wait a moment and try again. (${message})`
      )
    }

    throw new Error(message)
  }

  const data = await response.json()

  const parts = data?.candidates?.[0]?.content?.parts || []

  const text = parts
    .filter((part) => typeof part.text === 'string')
    .map((part) => part.text)
    .join('')

  if (!text) {
    throw new Error('Gemini returned no content.')
  }

  return text
}

/* -------------------------------------------------------
   Upload a file to Gemini Files API
------------------------------------------------------- */

async function uploadFileToGemini(file) {
  const apiKey = getApiKey()

  if (!file) {
    throw new Error('No file was provided.')
  }

  const isImage = file.type?.startsWith('image/')

  const sizeLimit = isImage
    ? MAX_IMAGE_SIZE
    : MAX_FILE_SIZE

  if (file.size > sizeLimit) {
    const limitMB = sizeLimit / (1024 * 1024)

    throw new Error(
      `"${file.name}" is too large. Maximum size is ${limitMB} MB.`
    )
  }

  const metadata = {
    file: {
      displayName: file.name,
    },
  }

  /* Start resumable upload */

  const startResponse = await fetch(
    FILE_UPLOAD_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length':
          String(file.size),
        'X-Goog-Upload-Header-Content-Type':
          file.type || 'application/octet-stream',
      },
      body: JSON.stringify(metadata),
    }
  )

  if (!startResponse.ok) {
    const errorText = await startResponse.text()

    throw new Error(
      `Could not start upload for "${file.name}": ${errorText}`
    )
  }

  const uploadUrl =
    startResponse.headers.get('X-Goog-Upload-URL')

  if (!uploadUrl) {
    throw new Error(
      `Gemini did not return an upload URL for "${file.name}".`
    )
  }

  /* Upload the actual file */

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': String(file.size),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()

    throw new Error(
      `Could not upload "${file.name}": ${errorText}`
    )
  }

  const result = await uploadResponse.json()

  const uploadedFile = result?.file

  if (!uploadedFile?.uri) {
    throw new Error(
      `Gemini did not return a file URI for "${file.name}".`
    )
  }

  return {
    fileUri: uploadedFile.uri,
    mimeType:
      uploadedFile.mimeType ||
      file.type ||
      'application/octet-stream',
    name: file.name,
  }
}

/* -------------------------------------------------------
   Convert an attachment into a Gemini part
------------------------------------------------------- */

async function attachmentToPart(attachment) {
  const file = attachment?.file

  if (!file) {
    return null
  }

  const uploaded = await uploadFileToGemini(file)

  return {
    fileData: {
      mimeType: uploaded.mimeType,
      fileUri: uploaded.fileUri,
    },
  }
}

/* -------------------------------------------------------
   Chat with Gemini
------------------------------------------------------- */

export async function chatWithGemini(
  history = [],
  newMessage = '',
  attachments = []
) {
  const contents = []

  /* Previous conversation */

  for (const message of history) {
    if (!message?.text && !message?.attachments?.length) {
      continue
    }

    const role =
      message.role === 'assistant'
        ? 'model'
        : 'user'

    const parts = []

    if (message.text) {
      parts.push({
        text: message.text,
      })
    }

    /*
      Previous attachments are normally temporary,
      so they are not re-uploaded here.
    */

    if (parts.length > 0) {
      contents.push({
        role,
        parts,
      })
    }
  }

  /* Current user message */

  const currentParts = []

  if (newMessage?.trim()) {
    currentParts.push({
      text: newMessage,
    })
  }

  /* Upload current attachments */

  for (const attachment of attachments) {
    const part = await attachmentToPart(attachment)

    if (part) {
      currentParts.push(part)
    }
  }

  if (currentParts.length === 0) {
    throw new Error(
      'Please enter a message or attach a file.'
    )
  }

  contents.push({
    role: 'user',
    parts: currentParts,
  })

  return callGemini(contents)
}

/* -------------------------------------------------------
   Quiz generator
------------------------------------------------------- */

export async function generateQuizWithGemini({
  sourceText,
  title = '',
  questionCount = 5,
}) {
  const prompt = `
You are creating a multiple-choice quiz for a student.

${title ? `Quiz title: ${title}` : ''}

Generate exactly ${questionCount} questions based on
the source material below.

Source material:
"""
${sourceText}
"""

Requirements:
- Exactly ${questionCount} questions.
- Each question must have exactly 4 answer choices.
- Only one answer may be correct.
- correctIndex must be 0, 1, 2, or 3.
- Keep questions appropriate for a student.
- Do not include markdown.
- Return ONLY valid JSON.

Return exactly this structure:

{
  "questions": [
    {
      "question": "string",
      "options": [
        "string",
        "string",
        "string",
        "string"
      ],
      "correctIndex": 0
    }
  ]
}
`

  const raw = await callGemini(
    [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    {
      json: true,
    }
  )

  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(
      'Gemini returned invalid quiz JSON.'
    )
  }

  if (
    !parsed ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length === 0
  ) {
    throw new Error(
      'Gemini returned no quiz questions.'
    )
  }

  return parsed.questions.map((question) => ({
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
  }))
}