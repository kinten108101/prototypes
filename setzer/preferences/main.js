import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

class PageBuildSystem {
  constructor(preferences, settings) {
    this.view = new PageBuildSystemView();
    this.preferences = preferences;
    this.settings = settings;
    this.latex_interpreters = [];
    this.latexmk_available = false;
    this.handle_latex_int_map = new Map();
  }

  init() {
    this.view.option_cleanup_build_files.set_active(
      this.settings.get_value("preferences", "cleanup_build_files"),
    );
    this.view.option_cleanup_build_files.connect("notify::active", () => {
      this.settings.set_value(
        "preferences",
        "cleanup_build_files",
        this.view.option_cleanup_build_files.get_active(),
      );
    });

    this.view.option_use_latexmk.set_active(
      this.settings.get_value("preferences", "use_latexmk"),
    );
    this.view.option_use_latexmk.connect("notify::active", () => {
      this.settings.set_value(
        "preferences",
        "use_latexmk",
        this.view.option_use_latexmk.get_active(),
      );
    });

    this.view.row_autoshow_build_log.connect("notify::selected", () => {
      const options = Object.keys(this.view._option_autoshow_build_log);
      const idx = this.view.row_autoshow_build_log.get_selected();
      let val = options[idx];
      if (options === undefined) val = options[0];
      this.settings.set_value("preferences", "autoshow_build_log", val);
    });
    this.view.row_autoshow_build_log.set_selected(
      (() => {
        const val = this.settings.get_value(
          "preferences",
          "autoshow_build_log",
        );
        const options = Object.keys(this.view._option_autoshow_build_log);
        let idx = options.indexOf(val);
        if (idx < 0) idx = 0;
        return idx;
      })(),
    );

    this.view.row_system_commands.connect("notify::selected", () => {
      const options = Object.keys(this.view._options_system_commands);
      const idx = this.view.row_system_commands.get_selected();
      let val = options[idx];
      if (options === undefined) val = options[0];
      this.settings.set_value(
        "preferences",
        "build_option_system_commands",
        val,
      );
    });
    this.view.row_system_commands.set_selected(
      (() => {
        const val = this.settings.get_value(
          "preferences",
          "build_option_system_commands",
        );
        const options = Object.keys(this.view._options_system_commands);
        let idx = options.indexOf(val);
        if (idx < 0) idx = 0;
        return idx;
      })(),
    );

    this.setup_latex_interpreters();

    this.update_row_latex_interpreter();
  }

  handle_latex_int_map_default() {
    this.view.no_interpreter_label.hide();
    this.view.tectonic_warning_label.hide();
    this.view.row_use_latexmk.show();
    this.view.row_system_commands.show();
  }

  handle_latex_int_map_no_int() {
    this.view.no_interpreter_label.show();
    this.view.tectonic_warning_label.hide();
    this.view.row_use_latexmk.show();
    this.view.row_system_commands.show();
  }

  setup_latex_interpreters() {
    for (const interpreter of ["xelatex", "pdflatex", "lualatex", "tectonic"]) {
      // check if cli exists.
      // const arguments_ = [interpreter, '--version'];
      // try {
      //   const proc = Gio.Subprocess.new(arguments_, Gio.SubprocessFlags.NONE);
      //   proc.wait(null);
      //   if (proc.get_successful()) {
      //     this.latex_interpreters.push(interpreter);
      //   }
      // } catch (error) {
      // }
      this.latex_interpreters.push(interpreter);
    }

    this.combo_index_2_id = [];
    for (const id in this.view.option_latex_interpreter) {
      if (this.latex_interpreters.includes(id)) {
        const name = this.view.option_latex_interpreter[id].name;
        this.view.combo_options_latex_interpreter.append(name);
        this.combo_index_2_id.push(id);
      } else {
      }
    }

    this.handle_latex_int_map.set("tectonic", () => {
      this.view.no_interpreter_label.hide();
      this.view.tectonic_warning_label.show();
      this.view.row_use_latexmk.hide();
      this.view.row_system_commands.hide();
    });

    this.view.latex_int_combobox.connect(
      "notify::selected",
      this.update_row_latex_interpreter.bind(this),
    );

    this.view.latex_int_combobox.connect("notify::selected", () => {
      const options = Object.keys(this.view.option_latex_interpreter);
      const idx = this.view.latex_int_combobox.get_selected();
      let val = options[idx];
      if (options === undefined) val = options[0];
      this.settings.set_value("preferences", "latex_interpreter", val);
    });
    this.view.latex_int_combobox.set_selected(
      (() => {
        const val = this.settings.get_value("preferences", "latex_interpreter");
        const options = Object.keys(this.view.option_latex_interpreter);
        let idx = options.indexOf(val);
        if (idx < 0) idx = 0;
        return idx;
      })(),
    );
  }

  update_row_latex_interpreter() {
    const handler =
      (() => {
        if (this.latex_interpreters.length === 0)
          return this.handle_latex_int_map_no_int.bind(this);
        const idx = this.view.latex_int_combobox.get_selected();
        const id = this.combo_index_2_id[idx];
        if (!id) return;
        return this.handle_latex_int_map.get(id);
      })() || this.handle_latex_int_map_default.bind(this);
    handler();
  }
}

class PageBuildSystemView extends Adw.PreferencesPage {
  static {
    GObject.registerClass({}, this);
  }

  constructor(params = {}) {
    super(params);
    this.option_latex_interpreter = {
      xelatex: {
        name: "XeLaTeX",
      },
      pdflatex: {
        name: "PdfLaTeX",
      },
      lualatex: {
        name: "LuaLaTeX",
      },
      tectonic: {
        name: "Tectonic",
      },
    };
    this.combo_options_latex_interpreter = new Gtk.StringList();

    this.latex_int_combobox = new Adw.ComboRow();
    this.latex_int_combobox.set_title("LaTeX Interpreter");
    this.latex_int_combobox.set_model(this.combo_options_latex_interpreter);

    this.no_interpreter_label = new Gtk.Label();
    this.no_interpreter_label.set_wrap(true);
    this.no_interpreter_label.set_xalign(0);
    this.no_interpreter_label.set_margin_top(12);
    this.no_interpreter_label.add_css_class("dim-label");
    this.no_interpreter_label.add_css_class("caption");
    this.no_interpreter_label
      .set_label(`No LaTeX interpreter found. To install interpreters in Flatpak, open a terminal and run the following command:
flatpak install org.freedesktop.Sdk.Extension.texlive`);

    this.tectonic_warning_label = new Gtk.Label();
    this.tectonic_warning_label.set_wrap(true);
    this.tectonic_warning_label.set_xalign(0);
    this.tectonic_warning_label.set_margin_top(12);
    this.tectonic_warning_label.add_css_class("dim-label");
    this.tectonic_warning_label.add_css_class("caption");
    this.tectonic_warning_label.set_label(
      "Please note: the Tectonic backend uses only the V1 command-line interface. Tectonic.toml configuration files are ignored.",
    );

    const first_group = new Adw.PreferencesGroup();
    first_group.add(this.latex_int_combobox);
    first_group.add(this.no_interpreter_label);
    first_group.add(this.tectonic_warning_label);

    this.option_cleanup_build_files = new Gtk.Switch();
    this.option_cleanup_build_files.set_valign(Gtk.Align.CENTER);

    this.row_cleanup_build_files = new Adw.ActionRow();
    this.row_cleanup_build_files.set_title("Post-build Clean-up");
    this.row_cleanup_build_files.set_subtitle(
      "Automatically remove helper files (.log, .dvi, …) after building .pdf.",
    );
    this.row_cleanup_build_files.add_suffix(this.option_cleanup_build_files);

    this.option_use_latexmk = new Gtk.Switch();
    this.option_use_latexmk.set_valign(Gtk.Align.CENTER);

    this.row_use_latexmk = new Adw.ActionRow();
    this.row_use_latexmk.set_title("Use Latexmk");
    this.row_use_latexmk.add_suffix(this.option_use_latexmk);

    const second_group = new Adw.PreferencesGroup();
    second_group.set_title("Options");
    second_group.add(this.row_cleanup_build_files);
    second_group.add(this.row_use_latexmk);

    this.option_autoshow_build_log = new Gtk.StringList();

    this._option_autoshow_build_log = {
      errors: {
        name: "Errors",
      },
      errors_warning: {
        name: "Errors + Warnings",
      },
      all: {
        name: "All",
      },
    };

    for (const id in this._option_autoshow_build_log) {
      const name = this._option_autoshow_build_log[id].name;
      this.option_autoshow_build_log.append(name);
    }

    this.row_autoshow_build_log = new Adw.ComboRow();
    this.row_autoshow_build_log.set_title("Show Build Log");
    this.row_autoshow_build_log.set_model(this.option_autoshow_build_log);

    this._options_system_commands = {
      disable: {
        name: "Disabled",
      },
      restricted: {
        name: "Enabled (Restricted)",
      },
      enable: {
        name: "Enabled (Full)",
      },
    };

    this.option_system_commands = new Gtk.StringList();
    for (const id in this._options_system_commands) {
      const name = this._options_system_commands[id].name;
      this.option_system_commands.append(name);
    }

    this.row_system_commands = new Adw.ComboRow();
    this.row_system_commands.set_title("Embedded System Commands");
    this.row_system_commands.set_subtitle(
      "Enable this only if you have to. It can cause security problems when building files from untrusted sources.",
    );
    this.row_system_commands.set_model(this.option_system_commands);

    const third_group = new Adw.PreferencesGroup();
    third_group.add(this.row_autoshow_build_log);
    third_group.add(this.row_system_commands);

    this.set_icon_name("build-symbolic");
    this.set_title("Build System");
    this.add(first_group);
    this.add(second_group);
    this.add(third_group);
  }
}

const settings = {
  memory: (() => {
    const map = new Map();
    map.toString = function () {
      let str = "";
      map.forEach((val, key) => {
        str += `\n\"${key}\": \"${val}\"`;
      });
      return str;
    };
    map.set(`preferences::cleanup_build_files`, false);
    map.set(`preferences::autoshow_build_log`, "");
    map.set(`preferences::build_option_system_commands`, "");
    map.set(`preferences::use_latexmk`, true);
    return map;
  })(),
  get_value(domain, key) {
    console.log(
      `Reading settings with domain \"${domain}\" and key \"${key}\"`,
    );
    return this.memory.get(`${domain}::${key}`);
  },
  set_value(domain, key, val) {
    console.log(
      `Writing settings with domain \"${domain}\", key \"${key}\", and value \"${val}\"`,
    );
    this.memory.set(`${domain}::${key}`, val);
  },
};

const page = new PageBuildSystem(null, settings);
page.init();

const window = workbench.builder.get_object("window");

const group = new Gio.SimpleActionGroup();
const print_stdout = new Gio.SimpleAction({
  name: "print-stdout",
});
print_stdout.connect("activate", () => {
  log(settings.memory);
});
group.add_action(print_stdout);
window.insert_action_group("test", group);
window.add(page.view);

