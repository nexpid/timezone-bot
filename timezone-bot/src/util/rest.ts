type DataThing = { headers: { [k: string]: string }; body?: unknown };

export class REST {
  async request(
    url: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    data?: DataThing
  ): Promise<any> {
    if (!data) data = { headers: {} };
    if (!data.headers) data.headers = {};
    for (const [x, y] of Object.entries(data.headers)) {
      delete data.headers[x];
      data.headers[x.toLowerCase()] = y;
    }
    data.headers["user-agent"] = "NotDiscordBot (https://discord.js.org)";

    if (data.headers["content-type"]) {
      if (!data.body)
        throw new Error("content-type exists but body is missing");

      if (data.headers["content-type"].includes("application/json"))
        data.body = JSON.stringify(data.body);
      else data.body = data.body.toString();
    }

    const body = {
      headers: data.headers,
      method,
      body: data.body?.toString(),
    };
    const response = await fetch(
      new Request(`https://discord.com/api/v10${url}`, body)
    );

    if (!response.ok)
      throw new Error(
        `${method} to ${url} failed: ${response.statusText} (${
          response.status
        })\n${await response.text()}\n\n${JSON.stringify(body, undefined, 3)}`
      );

    if (response.headers.get("content-type")?.includes("application/json"))
      return await response.json();
    else return await response.arrayBuffer();
  }

  async get(url: string, data?: DataThing) {
    return await this.request(url, "GET", data);
  }
  async post(url: string, data?: DataThing) {
    return await this.request(url, "POST", data);
  }
  async put(url: string, data?: DataThing) {
    return await this.request(url, "PUT", data);
  }
  async patch(url: string, data?: DataThing) {
    return await this.request(url, "PATCH", data);
  }
  async delete(url: string, data?: DataThing) {
    return await this.request(url, "DELETE", data);
  }
}
