import Gtk from "gi://Gtk";
import GtkSource from "gi://GtkSource?version=5";

const preview_wrapper = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
preview_wrapper.get_style_context().add_class("preview");
const scrolled_window = new Gtk.ScrolledWindow();
scrolled_window.set_max_content_height(240);
scrolled_window.set_propagate_natural_height(true);
const source_view = new GtkSource.View();
source_view.set_editable(false);
source_view.set_cursor_visible(false);
source_view.set_monospace(true);
source_view.set_wrap_mode(Gtk.WrapMode.WORD_CHAR);
source_view.set_show_line_numbers(false);
source_view.set_highlight_current_line(false);
source_view.set_left_margin(0);
scrolled_window.set_child(source_view);
const source_buffer = source_view.get_buffer();
source_buffer.set_highlight_matching_brackets(false);
source_buffer.set_text(
  `% Syntax highlighting preview
\\documentclass[letterpaper,11pt]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\begin{document}
\\section{Preview}
This is a \\textit{preview}, for $x, y \in \mathbb{R}: x \leq y$ or $x > y$.
\\end{document}`,
  -1,
);
source_buffer.place_cursor(source_buffer.get_start_iter());
preview_wrapper.append(scrolled_window);

const bin = workbench.builder.get_object("bin");
bin.set_child(preview_wrapper);

