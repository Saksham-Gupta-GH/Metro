const { metroLines, interchangeStations } = require('../data/metroData');

function buildMetroContext() {
  return Object.entries(metroLines)
    .map(([line, stations]) => `${line}: ${stations.join(', ')}`)
    .join('\n');
}

function getLocalAssistantReply(message) {
  const query = String(message || '').toLowerCase();

  if (query.includes('interchange')) {
    return `Major interchange stations are ${interchangeStations.join(', ')}.`;
  }

  const matchingLine = Object.keys(metroLines).find((line) =>
    query.includes(line.toLowerCase().replace(' line', ''))
  );

  if (matchingLine) {
    return `${matchingLine} has ${metroLines[matchingLine].length} stations. Key stops include ${metroLines[matchingLine]
      .slice(0, 6)
      .join(', ')}.`;
  }

  const stationMatch = Object.values(metroLines)
    .flat()
    .find((station) => query.includes(station.toLowerCase()));

  if (stationMatch) {
    const lines = Object.keys(metroLines).filter((line) => metroLines[line].includes(stationMatch));
    return `${stationMatch} is available on ${lines.join(', ')}.`;
  }

  return 'I can help with Bangalore Metro lines, important stations, interchanges, and route details. Ask about a station, line, or interchange.';
}

async function getAssistantReply(message, apiKey) {
  if (!apiKey) {
    return {
      reply: getLocalAssistantReply(message),
      source: 'local-fallback',
      fallbackReason: 'GEMINI_API_KEY is missing.',
    };
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    });
    const prompt = `You are a Bangalore Metro travel assistant for a student MERN project.
Answer briefly and practically.
Only answer about Bangalore Metro lines, stations, interchanges, basic travel guidance, and ticketing context.
If asked something outside this scope, answer the question quicky, then say you only handle Bangalore Metro help, kindly use me for that.

Bangalore Metro reference data:
${buildMetroContext()}

User question: ${message}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return {
      reply: text || getLocalAssistantReply(message),
      source: 'gemini',
    };
  } catch (error) {
    return {
      reply: `${getLocalAssistantReply(message)}\n\nNote: Gemini was unavailable, so this response used local metro data.`,
      source: 'local-fallback',
      fallbackReason: error.message || 'Gemini request failed.',
    };
  }
}

module.exports = {
  getAssistantReply,
};
