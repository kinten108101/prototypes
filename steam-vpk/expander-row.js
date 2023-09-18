import Gio from "gi://Gio";

const revealer = workbench.builder.get_object("revealer");
const action_map = workbench.builder.get_object("window");

const reveal = new Gio.SimpleAction({
  name: "reveal",
});
reveal.connect("activate", () => {
  revealer.set_reveal_child(!revealer.get_reveal_child());
});
action_map.add_action(reveal);
