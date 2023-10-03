const inject_button_styles = workbench.builder.get_object(
  "inject_button_styles",
);

inject_button_styles.connect("notify::selected-item", () => {
  console.log("hi", inject_button_styles.get_selected_item().get_string());
});

