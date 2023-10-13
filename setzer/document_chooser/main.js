import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Pango from "gi://Pango";

class Workspace extends GObject.Object {
  static {
    GObject.registerClass(
      {
        Signals: {
          update_recently_opened_documents: {
            param_types: [],
          },
        },
      },
      this,
    );
  }

  constructor(params = {}) {
    super(params);
    this.recently_opened_documents = new Gio.ListStore();
  }

  init() {
    this.recently_opened_documents.append(
      new DocumentEntry(Gio.File.new_for_path("wow.mpv")),
    );
    this.recently_opened_documents.append(
      new DocumentEntry(Gio.File.new_for_path("hello-world.txt")),
    );
    /*
    this.recently_opened_documents.remove(
      this.recently_opened_documents.get_n_items() - 1,
    );
    this.recently_opened_documents.remove(
      this.recently_opened_documents.get_n_items() - 1,
    );
    */
  }
}

class DocumentChooserPresenter extends GObject.Object {
  static {
    GObject.registerClass(
      {
        Properties: {
          search_string: GObject.ParamSpec.string(
            "search-string",
            "",
            "",
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            "",
          ),
        },
      },
      this,
    );
  }

  constructor(workspace) {
    super({});
    this.workspace = workspace;
    this.main_window = ServiceLocator.get_main_window();
    this.view = ServiceLocator.get_main_window().headerbar.document_chooser;
    this.view.factory.connect("bind", (obj, listitem) => {
      const child = listitem.get_child();
      const item = listitem.get_item();
      child.file_name.set_label(item.file.get_basename());
      child.file_path.set_label(item.file.get_path());
    });
    this.view.search_entry.connect("changed", (obj) => {
      this.search_string = obj.text;
    });
    this.workspace.recently_opened_documents.bind_property_full(
      "n-items",
      this.view.search_entry,
      "sensitive",
      GObject.BindingFlags.SYNC_CREATE,
      (_obj, from) => {
        if (from === 0) return [true, false];
        return [true, true];
      },
      null,
    );
    this.on_recently_opened_documents_changed(
      this.workspace.recently_opened_documents
    );
    this.workspace.recently_opened_documents.connect(
      "notify::n-items",
      this.on_recently_opened_documents_changed.bind(this),
    );
    this.connect("notify::search-string", () => {
      this.filter.changed(Gtk.FilterChange.DIFFERENT);
    });
    this.filter = Gtk.CustomFilter.new((item) => {
      if (!item instanceof DocumentEntry) return false;
      const path = item.file.get_path() || "";
      if (path.includes(this.search_string)) return true;
      return false;
    });
    const model = new Gtk.FilterListModel({
      model: this.workspace.recently_opened_documents,
      filter: this.filter,
    });
    this.on_filtered_recent_list_changed(
      model
    );
    model.connect("notify::n-items", this.on_filtered_recent_list_changed.bind(this));
    this.view.list.set_model(new Gtk.NoSelection({ model }));
  }

  on_recently_opened_documents_changed(obj) {
    const n = obj.get_n_items();
    if (n <= 0) {
      this.view.set_visible_child_name('empty');
    }
  }

  on_filtered_recent_list_changed(obj) {
    const n = obj.get_n_items();
    if (this.workspace.recently_opened_documents.get_n_items() <= 0) return;
    if (n <= 0) {
      this.view.set_visible_child_name("noresult");
    } else {
      this.view.set_visible_child_name("mainpage");
    }
  }
}

class DocumentRow extends Gtk.Box {
  static {
    GObject.registerClass({}, this);
  }

  constructor(params = {}) {
    super(params);
    this.set_spacing(8);
    const vbox_left = new Gtk.Box();
    vbox_left.set_orientation(Gtk.Orientation.VERTICAL);

    this.file_name = new Gtk.Label();
    this.file_name.set_label("test.txt"); // placeholder
    this.file_name.set_halign(Gtk.Align.START);
    this.file_name.set_ellipsize(Pango.EllipsizeMode.END);
    this.file_name.add_css_class("file_name");
    vbox_left.append(this.file_name);

    this.file_path = new Gtk.Label();
    this.file_path.set_label("~/Projects/test.txt"); // placeholder
    this.file_path.set_halign(Gtk.Align.START);
    this.file_path.set_ellipsize(Pango.EllipsizeMode.END);
    this.file_path.add_css_class("dim-label");
    this.file_path.add_css_class("file_path");
    vbox_left.append(this.file_path);

    this.append(vbox_left);

    const vbox_right = new Gtk.Box();
    vbox_right.set_orientation(Gtk.Orientation.VERTICAL);
    vbox_right.set_valign(Gtk.Align.CENTER);

    const remove = new Gtk.Button();
    remove.set_icon_name("cross-symbolic");
    remove.add_css_class("flat");
    remove.add_css_class("circular");
    vbox_right.append(remove);

    this.append(vbox_right);
  }
}

class DocumentEntry extends GObject.Object {
  static {
    GObject.registerClass({}, this);
  }

  constructor(file) {
    super({});
    this.file = file;
  }
}

class DocumentChooser extends Gtk.Popover {
  static {
    GObject.registerClass({}, this);
  }

  constructor(params = {}) {
    super(params);
    this.pages = new Map;

    const vbox = new Gtk.Box();
    vbox.set_orientation(Gtk.Orientation.VERTICAL);
    vbox.add_css_class("document_chooser");
    {
      const vvbox = new Gtk.Box();
      vvbox.set_orientation(Gtk.Orientation.VERTICAL);
      vvbox.set_spacing(6);

      const tophbox = new Gtk.Box();
      tophbox.set_spacing(6);
      tophbox.set_margin_top(6);
      tophbox.set_margin_start(6);
      tophbox.set_margin_end(6);

      this.search_entry = new Gtk.SearchEntry();
      this.search_entry.set_hexpand(true);
      tophbox.append(this.search_entry);

      this.other_documents_button = new Gtk.Button();
      this.other_documents_button.set_icon_name("document-open-symbolic");
      // NOTE(kinten): This is sucks
      this.other_documents_button.connect("clicked", () => {
        this.set_visible(false);
      });
      tophbox.append(this.other_documents_button);

      vvbox.append(tophbox);
      const separator = new Gtk.Separator();
      vvbox.append(separator);
      vbox.append(vvbox);
    }
    this.stack = new Gtk.Stack();
    const mainpage_box = new Gtk.Box();
    {
      const scroller = new Gtk.ScrolledWindow();
      scroller.set_hexpand(true);
      scroller.set_max_content_height(600);
      scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.ALWAYS);
      scroller.set_propagate_natural_height(true);
      scroller.set_vexpand(true);
      const viewport = new Gtk.Viewport();
      scroller.set_child(viewport);
      this.list = new Gtk.ListView();
      this.list.set_margin_top(0);
      this.list.set_margin_end(6);
      this.list.set_margin_start(6);
      this.list.add_css_class("navigation-sidebar");
      viewport.set_child(this.list);
      mainpage_box.append(scroller);

      this.factory = new Gtk.SignalListItemFactory();
      this.factory.connect("setup", (obj, listitem) => {
        const widget = new DocumentRow();
        listitem.set_child(widget);
      });
      this.list.set_factory(this.factory);
    }
    const mainpage = this.stack.add_child(mainpage_box);
    this.pages.set("mainpage", mainpage_box);
    mainpage.set_name("mainpage");

    const noresult_box = new Gtk.Box();
    noresult_box.set_halign(Gtk.Align.CENTER);
    noresult_box.set_valign(Gtk.Align.CENTER);
    {
      const content = new Gtk.Box();
      content.add_css_class("noresult_content");

      const no_result = new Gtk.Label();
      no_result.set_label("No Results Found");
      no_result.add_css_class("dim-label");
      content.append(no_result);

      noresult_box.append(content);
    }
    const noresult = this.stack.add_child(noresult_box);
    this.pages.set("noresult", noresult_box);
    noresult.set_name("noresult");

    const empty_box = new Gtk.Box();
    empty_box.set_orientation(Gtk.Orientation.VERTICAL);
    empty_box.set_halign(Gtk.Align.CENTER);
    empty_box.set_valign(Gtk.Align.CENTER);
    {
      const content = new Gtk.Box();
      content.set_orientation(Gtk.Orientation.VERTICAL);
      content.set_halign(Gtk.Align.CENTER);
      content.set_valign(Gtk.Align.CENTER);
      content.add_css_class("empty_page_content");

      const icon = new Gtk.Image();
      icon.set_from_icon_name("document-open-recent-symbolic");
      icon.set_icon_size(Gtk.IconSize.LARGE);
      icon.add_css_class("dim-label");
      content.append(icon);

      const text = new Gtk.Label();
      text.set_label("No Recent Documents");
      text.set_wrap(true);
      text.set_wrap_mode(Pango.WrapMode.WORD_CHAR);
      text.add_css_class("dim-label");
      content.append(text);

      empty_box.append(content);
    }
    const empty = this.stack.add_child(empty_box);
    this.pages.set("empty", empty_box);
    empty.set_name("empty");

    vbox.append(this.stack);
    this.set_child(vbox);
  }

  set_visible_child_name(name) {
    this.stack.set_visible_child_name(name);
    this.pages.forEach((x, key) => {
      if (key === name) {
        x.set_visible(true);
      } else {
        x.set_visible(false);
      }
    });
  }
}

const ServiceLocator = {
  get_main_window() {
    return {
      headerbar: {
        document_chooser: popover,
      },
    };
  },
};

const workspace = new Workspace();
workspace.init();

const button = workbench.builder.get_object("button");

const popover = new DocumentChooser();

button.set_popover(popover);

new DocumentChooserPresenter(workspace);

const application = workbench.application;

const add_item = new Gio.SimpleAction({
  name: 'add-item',
});
add_item.connect('activate', () => {
  workspace.recently_opened_documents.append(
    new DocumentEntry(Gio.File.new_for_path("wow.mpv")),
  );  
});
application.add_action(add_item);
application.set_accels_for_action('app.add-item', ['<Primary>j']);

const remove_item = new Gio.SimpleAction({
  name: 'remove-item',
});
remove_item.connect('activate', () => {
  workspace.recently_opened_documents.remove(
    workspace.recently_opened_documents.get_n_items() - 1,
  ); 
});
application.add_action(remove_item);
application.set_accels_for_action('app.remove-item', ['<Primary>k']);



