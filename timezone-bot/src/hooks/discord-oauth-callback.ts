const content = (query: URLSearchParams) => `<script>
  const newurl = new URL(location.href);
  newurl.pathname = "/${
    query.get("update") === "true" ? "update-callback" : "timezone-callback"
  }";
  const params = new URLSearchParams(newurl.search);
  params.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  params.append("country", confirm("Include your country's code in your timezone?\\nexample: UTC+2:00 (CZ, Europe)").toString());
  newurl.search = "?" + params.toString();

  location.href = newurl.toString();
</script>`;

export default (req: Request) => {
  const url = new URL(req.url);
  const query = url.searchParams;

  return new Response(content(query), {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
    },
  });
};
