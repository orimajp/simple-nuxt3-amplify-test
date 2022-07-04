exports.handler = async (event, context) => {
  const { handler  } = await import('./.output/server/index.mjs');
  const result = await handler (event);
  
  return result;
}