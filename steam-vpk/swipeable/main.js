import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

const box = workbench.builder.get_object("box");

const SwipeableButton = GObject.registerClass(
  {
    Implements: [Adw.Swipeable],
  },
  class extends Gtk.Button {
    scroll_threshold = 10;

    delta = 0;

    constructor(params = {}) {
      super(params);
      this.swipe_progress = 0;
      this.tracker = new Adw.SwipeTracker({
        swipeable: this,
        allow_mouse_drag: true,
        allow_long_swipes: true,
      });
      this.tracker.connect("begin-swipe", () => {
        console.log("begin-swipe");
      });
      this.tracker.connect("end-swipe", (_obj, velocity, to) => {
        console.log("end-swipe", velocity, to);
      });
      this.tracker.connect("update-swipe", (object, progress) => {
        console.log("progress:", progress);
      });
      this.scroller = new Gtk.EventControllerScroll();
      this.scroller.set_flags(
        Gtk.EventControllerScrollFlags.KINETIC |
          Gtk.EventControllerScrollFlags.VERTICAL,
      );
      this.scroller.connect("scroll-begin", (object) => {
        this.tracker.emit("begin-swipe");
      });
      this.scroller.connect("scroll-end", (object) => {
        this.tracker.emit("end-swipe", this.delta, -1);
      });
      this.scroller.connect("scroll", (object, dx, dy) => {
        this.delta = dy;
      });
      this.add_controller(this.scroller);
    }
  },
);

const button = new SwipeableButton({ label: "shit" });
box.append(button);

