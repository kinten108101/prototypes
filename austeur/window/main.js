import Gio from "gi://Gio";

const application = workbench.application;

const delete_writing = new Gio.SimpleAction({
  name: "delete-writing",
});
application.add_action(delete_writing);
application.set_accels_for_action("app.delete-writing", ["<primary>d"]);

const export_writing = new Gio.SimpleAction({
  name: "export-writing",
});
application.add_action(export_writing);
application.set_accels_for_action("app.export-writing", ["<primary>e"]);

const window = workbench.builder.get_object("window");
window.set_application(application);

const isEmptyContent = fals;

const content_pane_headerbar_stack = workbench.builder.get_object(
  "content_pane_headerbar_stack",
);

content_pane_headerbar_stack.set_visible_child_name(
  isEmptyContent ? "empty" : "has-content",
);

