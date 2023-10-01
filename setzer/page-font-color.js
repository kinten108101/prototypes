import GObject from "gi://GObject";

const expander = workbench.builder.get_object("expander");
const sw = workbench.builder.get_object("sw");

expander.bind_property(
  "expanded",
  sw,
  "active",
  GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL,
);
