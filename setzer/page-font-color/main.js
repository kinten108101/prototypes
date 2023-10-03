import GObject from "gi://GObject";
import Gtk from "gi://Gtk";

const window = workbench.builder.get_object("window");

const expander = workbench.builder.get_object("expander");
const sw = workbench.builder.get_object("sw");

expander.bind_property(
  "expanded",
  sw,
  "active",
  GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL,
);

const font_button = workbench.builder.get_object("font_button");
const font_button_label = workbench.builder.get_object("font_button_label");
const font_dialog = new Gtk.FontChooserDialog();
font_dialog.bind_property(
  "font",
  font_button_label,
  "label",
  GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL,
);
font_dialog.set_modal(true);
font_dialog.set_transient_for(window);
font_dialog.connect("response", () => {
  font_dialog.close();
});
font_dialog.set_hide_on_close(true);
font_button.connect("clicked", () => {
  font_dialog.show();
});

