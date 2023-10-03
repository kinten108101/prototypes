class TabSwitcher {
  constructor({ buttons }) {
    this.current_button = undefined;
    this.buttons = buttons;

    for (const button_name in this.buttons) {
      const button = this.buttons[button_name];
      button.connect("clicked", () => {
        this.current_button = button;
        this._update_tab_switcher();
      });
    }
  }

  set_button(button_name) {
    const button = this.buttons[button_name];
    button.set_active(true);
    this.current_button = button;
    this._update_tab_switcher();
  }

  _update_tab_switcher() {
    for (const button_name in this.buttons) {
      const button = this.buttons[button_name];
      if (button === this.current_button) continue;
      button.set_active(false);
    }
  }
}

const right_tab_switcher = new TabSwitcher({
  buttons: {
    button_help: workbench.builder.get_object("button_help"),
    button_preview: workbench.builder.get_object("button_preview"),
  },
});

const left_tab_switcher = new TabSwitcher({
  buttons: {
    document_structure_toggle: workbench.builder.get_object(
      "document_structure_toggle",
    ),
    symbols_toggle: workbench.builder.get_object("symbols_toggle"),
  },
});

// init
right_tab_switcher.set_button("button_help");
left_tab_switcher.set_button("symbols_toggle");
