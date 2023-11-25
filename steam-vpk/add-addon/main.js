import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Soup from "gi://Soup";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

Gio._promisify(Soup.Session.prototype, "send_async", "send_finish");

const app = workbench.builder.get_object("window");
const steamID = workbench.builder.get_object("steamid");

steamID.connect("apply", async () => {
  try {
    const input_stream = await getInputStream();
    const gbytes = input_stream.read_bytes(8192, null);
    log(decoder.decode(gbytes.get_data()));
  } catch (error) {
    logError(error);
  }
});

async function getInputStream() {
  try {
    const session = new Soup.Session();
    const url =
      "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/";
    const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
    const requestBody = encoder.encode(
      "access_token=ac52a3a6c7496f8f71be2cf9f3fefdc7&itemcount=1&publishedfileids%5B0%5D=1186789615",
    );
    const message = new Soup.Message({
      method: "POST",
      uri,
    });
    message.set_request_body_from_bytes(
      "application/x-www-form-urlencoded",
      new GLib.Bytes(requestBody),
    );
    const input_stream = await session.send_async(message, null, null);
    const { status_code, reason_phrase, response_headers } = message;
    console.log(status_code);
    return input_stream;
  } catch (error) {
    logError(error);
  }
}

