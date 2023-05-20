export default (path: string) => {
  return new Response(`path ${path} not found,!?!?`, { status: 404 });
};
