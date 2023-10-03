import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

const menu_button = workbench.builder.get_object("menu_button");

class PopoverMenu extends Gtk.PopoverMenu {
  static {
    GObject.registerClass({}, PopoverMenu);
  }

  constructor(params = {}) {
    super(params);
    const model = new Gio.Menu();
    this.set_menu_model(model);
    const current_section = new Gio.Menu();
    model.append_section(null, current_section);
    this.page_map = new Map();
    this.page_map.set("main", {
      model,
      current_section,
    });
  }
}

let prev_id = 0;
function generate_id() {
  return prev_id++;
}

class MenuBuilderV2 {
  create_menu() {
    const popover = new PopoverMenu();
    return popover;
  }

  create_button(label, icon_name) {
    const item = new Gio.MenuItem();
    if (label) item.set_label(label);
    if (icon_name) item.set_icon_name(icon_name);
    return item;
  }

  create_menu_button(label) {
    const item = new Gio.MenuItem();
    item.set_label(label);
    return item;
  }

  add_page(menu, pagename, label) {
    const model = new Gio.Menu();
    const current_section = new Gio.Menu();
    model.append_section(null, current_section);
    menu.page_map.set(pagename, {
      model,
      current_section,
    });
  }

  link_to_menu(menu, item, pagename) {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { model } = page;
    item.set_submenu(model);
  }

  add_item(menu, item, pagename = "main") {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { current_section } = page;
    current_section.append_item(item);
  }

  add_custom_widget(menu, widget, pagename = "main") {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { current_section } = page;
    const item = new Gio.MenuItem();
    const id = String(generate_id());
    item.set_attribute_value("custom", GLib.Variant.new_string(id));
    current_section.append_item(item);
    menu.add_child(widget, id);
  }

  add_separator(menu, pagename = "main") {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { model } = page;
    page.current_section = new Gio.Menu();
    model.append_section(null, page.current_section);
  }
}

const builder = new MenuBuilderV2();
const popover = builder.create_menu();
menu_button.set_popover(popover);

const button_one = builder.create_button("hi");
builder.add_item(popover, button_one);

builder.add_separator(popover);

const button_two = builder.create_button("two");
builder.add_item(popover, button_two);

builder.add_separator(popover);

builder.add_page(popover, "secondary", "Secondary");

const button_to_secondary = builder.create_menu_button("Go to Secondary");
builder.link_to_menu(popover, button_to_secondary, "secondary");
builder.add_item(popover, button_to_secondary);

const button_test = builder.create_button("Test");
builder.add_item(popover, button_test, "secondary");

builder.add_separator(popover, "secondary");

const button_new = builder.create_button("New");
builder.add_item(popover, button_new, "secondary");

const button_run = new Gtk.Button();
button_run.set_label("Run");
builder.add_custom_widget(popover, button_run, "secondary");

