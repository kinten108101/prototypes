import Gtk from "gi://Gtk";

const makePage = () => {
  const view = new Gtk.Box();
  view.set_halign(Gtk.Align.CENTER);
  view.set_valign(Gtk.Align.CENTER);
  const item = new Gtk.Spinner();
  item.set_spinning(true);
  view.append(item);
  return view;
};

const tab_view = workbench.builder.get_object("tab_view");
var page = tab_view.append(makePage());
page.set_title("timelines");
page = tab_view.append(makePage());
page.set_title("austeur-android");

const tab_button = workbench.builder.get_object("tab_button");
const tab_overview = workbench.builder.get_object("tab_overview");
tab_button.connect("clicked", () => {
  tab_overview.set_open(true);
});

