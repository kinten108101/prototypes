import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

class ApplicationV2 extends GObject.Object {
  static {
    GObject.registerClass({
      GTypeName: 'ApplicationV2',
      Signals: {
        'accel-changed': {
          param_types: [{}],
          flags: GObject.SignalFlags.DETAILED,
        },
      },
    }, this);
  }

  static _instance;

  static get_instance() {
    if (!this._instance) {
      this._instance = new ApplicationV2;
    }
    return this._instance;
  }

  static connect(signal, callback) {
    return this.get_instance().connect(signal, callback);
  }

  static disconnect(id) {
    return this.get_instance().disconnect(id);
  }

  static set_accels_for_action(application, detailed_action_name, accels) {
    application.set_accels_for_action(detailed_action_name, accels);
    this.get_instance().emit('accel-changed::' + detailed_action_name, accels);
  }
}

const menu_button = workbench.builder.get_object("menu_button");

class MenuItemTest extends Gio.MenuItem {
  static {
    GObject.registerClass({}, this);
  }

  constructor(params = {}) {
    super({});
  }

  set_detailed_action(name) {
    super.set_detailed_action(name);
    if ('reload' in this) {
      this.reload();
      ApplicationV2.connect('accel-changed::'+name, () => {
        console.log('ok');
        this.reload();
      });
    }
  }

  connect(signal, callback) {
    if (signal === 'clicked') {
      const name = 'menu.'+String(generate_id());
      console.log(MenuItemTest.name + '::connect::clicked', name)
      const action = new Gio.SimpleAction({
        name,
      });
      action.connect('activate', () => {
        callback(this);
      });
      group.add_action(action);
      const detailed_name = 'test.' + name;
      this.set_detailed_action(detailed_name);
    }
  }
}

class MenuTest extends Gio.Menu {
  static {
    GObject.registerClass({}, this);
  }

  constructor() {
    super({});
    this.item_map = new WeakMap;
    this.count = 0;
  }

  reload_menuitem(menuitem) {
    const idx = this.item_map.get(menuitem);
    this.remove(idx);
    this.insert_item(idx, menuitem);
  }

  insert_item(pos, menuitem) {
    super.insert_item(pos, menuitem);
    menuitem.reload = () => this.reload_menuitem(menuitem);
    this.item_map.set(menuitem, pos);
    this.count++;
  }

  append_item(menuitem) {
    super.append_item(menuitem);
    menuitem.reload = () => this.reload_menuitem(menuitem);
    this.item_map.set(menuitem, this.count);
    this.count++;
  }
}

class PopoverMenu extends Gtk.PopoverMenu {
  static {
    GObject.registerClass({}, PopoverMenu);
  }

  constructor(params = {}) {
    super(params);
    const model = new MenuTest();
    this.set_menu_model(model);
    const current_section = new MenuTest();
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
  static create_menu() {
    const popover = new PopoverMenu();
    return popover;
  }

  static create_button(label, icon_name) {
    const item = new MenuItemTest();
    if (label) item.set_label(label);
    if (icon_name) item.set_icon_name(icon_name);
    return item;
  }

  static create_menu_button(label) {
    const item = new MenuItemTest();
    item.set_label(label);
    return item;
  }

  static add_page(menu, pagename, label) {
    const model = new MenuTest();
    const current_section = new MenuTest();
    model.append_section(null, current_section);
    menu.page_map.set(pagename, {
      model,
      current_section,
    });
  }

  static link_to_menu(menu, item, pagename) {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { model } = page;
    item.set_submenu(model);
  }

  static add_item(menu, item, pagename = "main") {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { current_section } = page;
    current_section.append_item(item);
  }

  static add_custom_widget(menu, widget, pagename = "main") {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { current_section } = page;
    const item = new MenuItemTest();
    const id = String(generate_id());
    item.set_attribute_value("custom", GLib.Variant.new_string(id));
    current_section.append_item(item);
    menu.add_child(widget, id);
  }

  static add_separator(menu, pagename = "main") {
    const page = menu.page_map.get(pagename);
    if (page === undefined) throw new Error();
    const { model } = page;
    page.current_section = new MenuTest();
    model.append_section(null, page.current_section);
  }
}

const popover = MenuBuilderV2.create_menu();
menu_button.set_popover(popover);

const button_one = MenuBuilderV2.create_button("hi");
MenuBuilderV2.add_item(popover, button_one);

MenuBuilderV2.add_separator(popover);

const button_two = MenuBuilderV2.create_button("two");
MenuBuilderV2.add_item(popover, button_two);

MenuBuilderV2.add_separator(popover);

MenuBuilderV2.add_page(popover, "secondary", "Secondary");

const button_to_secondary = MenuBuilderV2.create_menu_button("Go to Secondary");
MenuBuilderV2.link_to_menu(popover, button_to_secondary, "secondary");
MenuBuilderV2.add_item(popover, button_to_secondary);

const button_test = MenuBuilderV2.create_button("Test");
MenuBuilderV2.add_item(popover, button_test, "secondary");

MenuBuilderV2.add_separator(popover, "secondary");

const button_new = MenuBuilderV2.create_button("New");
MenuBuilderV2.add_item(popover, button_new, "secondary");

const button_run = new Gtk.Button();
button_run.set_label("Run");
MenuBuilderV2.add_custom_widget(popover, button_run, "secondary");

const group = new Gio.SimpleActionGroup();

const close = new Gio.SimpleAction({
  name: 'close',
});
close.connect('activate', () => {
  console.log('hi');
});
group.add_action(close);

workbench.builder.get_object("window").insert_action_group('test', group);

button_two.connect('clicked', () => {
  console.log('clicked');
});
ApplicationV2.set_accels_for_action(workbench.application, 'test.menu.1', ['<Ctrl>j']);
