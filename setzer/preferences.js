import GObject from 'gi://GObject';
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

class PageBuildSystem {
  constructor() {
    this.view = new PageBuildSystemView();
  }
}

class PageBuildSystemView extends Adw.PreferencesPage {
  static {
    GObject.registerClass({}, this);
  }

  constructor(params = {}) {
    super(params);
    const option_latex_interpreter = [
      {
        id: "xelatex",
        name: "XeLaTeX",
      },
      {
        id: "pdflatex",
        name: "PdfLaTeX",
      },
      {
        id: "lualatex",
        name: "LuaLaTeX",
      },
      {
        id: "tectonic",
        name: "Tectonic",
      },
    ];
    const options_latex_interpreter = new Gtk.StringList();

    for (const {id, name} of option_latex_interpreter) {
      options_latex_interpreter.append(name);
    }


    const handle_latex_int_map = new Map();
    handle_latex_int_map.set("tectonic", () => {
      no_interpreter_label.hide();
      tectonic_warning_label.show();
      row_use_latexmk.hide();
      row_system_commands.hide();
    });
    function handle_latex_int_map_default() {
      no_interpreter_label.hide();
      tectonic_warning_label.hide();
      row_use_latexmk.show();
      row_system_commands.show();
    }
    function handle_latex_int_map_no_int() {
      no_interpreter_label.show();
      tectonic_warning_label.hide();
      row_use_latexmk.show();
      row_system_commands.show(); 
    }

    const latex_int_combobox = new Adw.ComboRow();
    latex_int_combobox.set_title("LaTeX Interpreter");
    latex_int_combobox.set_model(options_latex_interpreter);
    function update_row_latex_interpreter() {
      const handler = (() => {
        const idx = latex_int_combobox.get_selected();
        const id = option_latex_interpreter[idx]?.id;
        if (!id) return;
        return handle_latex_int_map.get(id);
      })() || handle_latex_int_map_default;
      handler();
    }
    latex_int_combobox.connect("notify::selected", update_row_latex_interpreter);

    const no_interpreter_label = new Gtk.Label();
    no_interpreter_label.set_wrap(true);
    no_interpreter_label.set_xalign(0);
    no_interpreter_label.set_margin_top(12);
    no_interpreter_label.add_css_class("dim-label");
    no_interpreter_label.add_css_class("caption");
    no_interpreter_label.set_label(`No LaTeX interpreter found. To install interpreters in Flatpak, open a terminal and run the following command:
flatpak install org.freedesktop.Sdk.Extension.texlive`);

    const tectonic_warning_label = new Gtk.Label();
    tectonic_warning_label.set_wrap(true);
    tectonic_warning_label.set_xalign(0);
    tectonic_warning_label.set_margin_top(12);
    tectonic_warning_label.add_css_class("dim-label");
    tectonic_warning_label.add_css_class("caption");
    tectonic_warning_label.set_label(
      "Please note: the Tectonic backend uses only the V1 command-line interface. Tectonic.toml configuration files are ignored.",
    );

    const first_group = new Adw.PreferencesGroup();
    first_group.add(latex_int_combobox);
    first_group.add(no_interpreter_label);
    first_group.add(tectonic_warning_label);

    const option_cleanup_build_files = new Gtk.Switch();
    option_cleanup_build_files.set_valign(Gtk.Align.CENTER);

    const row_cleanup_build_files = new Adw.ActionRow();
    row_cleanup_build_files.set_title("Post-build Clean-up");
    row_cleanup_build_files.set_subtitle(
      "Automatically remove helper files (.log, .dvi, …) after building .pdf.",
    );
    row_cleanup_build_files.add_suffix(option_cleanup_build_files);

    const option_use_latexmk = new Gtk.Switch();
    option_use_latexmk.set_valign(Gtk.Align.CENTER);

    const row_use_latexmk = new Adw.ActionRow();
    row_use_latexmk.set_title("Use Latexmk");
    row_use_latexmk.add_suffix(option_use_latexmk);

    const second_group = new Adw.PreferencesGroup();
    second_group.set_title("Options");
    second_group.add(row_cleanup_build_files);
    second_group.add(row_use_latexmk);

    const option_autoshow_build_log_errors = new Gtk.StringList();

    for (const name of ["Errors", "Errors + Warnings", "All"]) {
      option_autoshow_build_log_errors.append(name);
    }

    const row_autoshow_build_log_error = new Adw.ComboRow();
    row_autoshow_build_log_error.set_title("Show Build Log");
    row_autoshow_build_log_error.set_model(option_autoshow_build_log_errors);

    const option_system_commands = new Gtk.StringList();
    for (const name of ["Disabled", "Enabled (Restricted)", "Enabled (Full)"]) {
      option_system_commands.append(name);
    }

    const row_system_commands = new Adw.ComboRow();
    row_system_commands.set_title("Embedded System Commands");
    row_system_commands.set_subtitle(
      "Enable this only if you have to. It can cause security problems when building files from untrusted sources.",
    );
    row_system_commands.set_model(option_system_commands);

    const third_group = new Adw.PreferencesGroup();
    third_group.add(row_autoshow_build_log_error);
    third_group.add(row_system_commands);

    this.set_icon_name("build-symbolic");
    this.set_title("Build System");
    this.add(first_group);
    this.add(second_group);
    this.add(third_group);

    

    // update
    update_row_latex_interpreter();

  }
}

const page = new PageBuildSystem;

const window = workbench.builder.get_object("window");
window.add(page.view);
