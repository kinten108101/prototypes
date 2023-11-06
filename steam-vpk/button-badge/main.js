import GObject from "gi://GObject";
import Gtk from "gi://Gtk";

class Badge extends Gtk.Label {
  static {
    GObject.registerClass(
      {
        GTypeName: "StvpkBadge",
        CssName: "badge",
      },
      this,
    );
  }
}

class IconWithBadge extends Gtk.Box {
  static {
    GObject.registerClass({
      GTypeName: 'StvpkIconWithBadge',
      Properties: {
        icon_name: GObject.ParamSpec.string(
          'icon-name', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          null),
        icon_size: GObject.ParamSpec.enum(
          'icon-size', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          Gtk.IconSize.$gtype,
          Gtk.IconSize.INHERIT),
        pixel_size: GObject.ParamSpec.int(
          'pixel-size', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          -1, Number.MAX_SAFE_INTEGER,
          -1),
        count: GObject.ParamSpec.uint64(
          'count', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          0, Number.MAX_SAFE_INTEGER,
          0),
      },
    }, this);
  }

  constructor(params) {
    super({
      // @ts-ignore
      icon_name: params.icon_name || null,
      // @ts-ignore
      count: params.count || null,
    });
    const overlay = new Gtk.Overlay();

    const image = new Gtk.Image();
    this.bind_property('icon-name', image, 'icon-name',
      GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('icon-size', image, 'icon-size',
      GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('pixel-size', image, 'pixel-size',
      GObject.BindingFlags.SYNC_CREATE);
    overlay.set_child(image);

    const overlay_layer = new Gtk.Box();
    overlay_layer.set_valign(Gtk.Align.START);
    overlay_layer.set_halign(Gtk.Align.END);
    const badge = new Badge();
    overlay_layer.append(badge);
    this.bind_property_full('count', badge, 'label',
      GObject.BindingFlags.SYNC_CREATE,
      (_binding, from) => {
        if (from < 2) {
          badge.set_visible(false);
          return [true, ''];
        }
        badge.set_visible(true);
        return [true, String(from)];
      },
      () => {});
    overlay.add_overlay(overlay_layer);

    const layout = new Gtk.BinLayout();
    this.set_layout_manager(layout);
    this.append(overlay);
  }
}

const box = workbench.builder.get_object("box");
const button = new Gtk.Button({});
const icon = new IconWithBadge({
  icon_name: "pip-in-symbolic",
});
icon.pixel_size = 24;
icon.count = 2;
button.set_child(icon);
button.add_css_class("flat");
box.append(button);

