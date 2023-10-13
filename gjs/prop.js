var GObject = imports.gi.GObject;

class A extends GObject.Object {
  static {
    GObject.registerClass({
      Properties: {
        home_address: GObject.ParamSpec.string(
          'home-address', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          'unset'),
        pet_name: GObject.ParamSpec.string(
          'pet-name', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          'unset'),
        age: GObject.ParamSpec.uint64(
          'age', '', '',
          GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
          0, Number.MAX_SAFE_INTEGER,
          0),
      },
    }, this);
  }
}

const getter_map = {
  [GObject.TYPE_STRING]: (gvalue) => gvalue.get_string(),
  [GObject.TYPE_UINT64]: (gvalue) => gvalue.get_uint64(),
};

const a = new A;
a.connect('notify', (object, pspec) => {
  const name = pspec.name;
  console.log('name:', name);
  const type = pspec.value_type;
  console.log('type:', type.name);
  const buf = new GObject.Value();
  object.get_property(name, buf);
  const content = getter_map[type]?.(buf);
  console.log('content', content);
});

a.home_address = '512 Bottle Street';
a.pet_name = 'keroshi';
a.age = 5;
