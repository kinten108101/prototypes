import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Pango from "gi://Pango";

class Row extends Gtk.Box {
  static {
    GObject.registerClass({}, this);
  }

  constructor(name, dir) {
    super({});
    this.set_spacing(12);
    this.set_margin_start(12);
    this.set_margin_end(12);
    this.set_margin_top(6);
    this.set_margin_bottom(10);
    this.checkbutton = new Gtk.CheckButton();
    this.append(this.checkbutton);
    const vbox = new Gtk.Box();
    vbox.set_orientation(Gtk.Orientation.VERTICAL);
    vbox.set_spacing(2);
    const name_label = new Gtk.Label();
    name_label.set_label(name);
    name_label.set_xalign(0);
    name_label.set_ellipsize(Pango.EllipsizeMode.END);
    vbox.append(name_label);
    const dir_label = new Gtk.Label();
    dir_label.set_label(dir);
    dir_label.set_xalign(0);
    dir_label.add_css_class("dim-label");
    dir_label.add_css_class("subtitle");
    dir_label.set_ellipsize(Pango.EllipsizeMode.END);
    vbox.append(dir_label);
    this.append(vbox);
  }
}

const button = workbench.builder.get_object("button");
button.connect("clicked", () => {
  const dialog = new Adw.MessageDialog({
    transient_for: workbench.window,
  });
  dialog.get_style_context().add_class("my-dialog");
  dialog.set_heading("Save Changes?");
  dialog.set_body("Changes will be permanently lost.");
  dialog.add_response("ok", "Save");
  dialog.add_response("cancel", "Cancel");
  const list = new Gtk.ListBox();
  list.set_size_request(440, -1);
  list.set_selection_mode(Gtk.SelectionMode.NONE);
  list.set_margin_top(24);
  list.set_margin_bottom(32);
  list.set_margin_start(48);
  list.set_margin_end(48);
  list.append(new Row("wow.txt", "~/projects/design-series"));
  list.append(new Row("steam-md-keys", "~/.local/share/Steam"));
  list.append(
    new Row(
      "README.md",
      "~/Repositories/MoreWaita/subprojects/One/subprojects/libtroll",
    ),
  );
  list.append(new Row("README.md", "~/Repositories/MoreWaita"));
  list.append(new Row("README.md", "~/Repositories/MoreWaita"));
  list.append(new Row("README.md", "~/Repositories/MoreWaita"));
  list.append(new Row("README.md", "~/Repositories/MoreWaita"));
  list.append(new Row("README.md", "~/Repositories/MoreWaita"));
  list.add_css_class("boxed-list");
  const box = new Gtk.Box();
  box.set_halign(Gtk.Align.CENTER);
  box.set_valign(Gtk.Align.CENTER);
  box.add_css_class("close-confirmation-list");
  box.append(list);
  const scroller = new Gtk.ScrolledWindow();
  scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
  scroller.set_max_content_height(240);
  scroller.set_propagate_natural_height(true);
  scroller.set_child(box);
  dialog.set_extra_child(scroller);
  dialog.show();
});

