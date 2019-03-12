module.exports = function metadata(jsFiles = [], cssFiles = []) {
  // Build files include a hash in there name for better caching. Because of
  // of that we need pass the latest filesnames to the worker, so it can render
  // the appropriate script and link tags.
  const data = {
    body_part: "script",
    bindings: [
      {
        name: "JS_FILES",
        type: "secret_text",
        text: jsFiles.join(" ")
      },
      {
        name: "CSS_FILES",
        type: "secret_text",
        text: cssFiles.join(" ")
      }
    ]
  };

  // Namespaces are defined by their name and id, separated by a space. If you
  // need to bind multiple KV namespaces, separate the pairs with a comma,
  // example: CF_KV_NAMESPACES="NAME_ONE xx679c2zz5e3870yyzzz, NAME_TWO aa899cbbb5e5900yyccc"
  const nsEnvVar = process.env.CF_KV_NAMESPACES;
  if (nsEnvVar) {
    const namespaces = splitKeyVals(nsEnvVar);
    data.bindings = data.bindings.concat(
      namespaces.map(([name, inamespace_id]) => ({
        name,
        type: "kv_namespace",
        namespace_id
      }))
    );
  }

  // Similar to namespaces, you can bind any values you like to the worker using
  // key values using the CF_WORKER_BINDINGS env var, example:
  // CF_WORKER_BINDINGS="KEY_ONE somevalue, KEY_TWO anothervalue"
  const bindingEnvVar = process.env.CF_WORKER_BINDINGS;
  if (bindingEnvVar) {
    const bindings = splitKeyVals(bindingEnvVar);
    data.bindings = data.bindings.concat(
      namespaces.map(([name, text]) => ({
        name,
        type: "secret_text",
        text
      }))
    );
  }

  return data;
};

function splitKeyVals(str) {
  return str.split(",").map(pair => pair.split(" "));
}
