module.exports = grammar({
  name: 'cypher',
  rules: {
    cypher: $ => seq($._query, optional(";")),
    _query: $ => choice(
      seq(
        repeat($._reading_clause),
        $.return
      ),
      seq(
        repeat($._reading_clause),
        repeat1($._updating_clause),
        optional($.return)
      )
    ),

    _reading_clause: $ => choice(
      $.match
    ),
    match: $ => seq(
      optional("OPTIONAL"),
      "MATCH",
      $._pattern,
      optional($.where)
    ),
    _pattern: $ => $.pattern_element,
    pattern_element: $ => choice(
      seq(
        $.node_pattern,
        repeat($._pattern_element_chain),
      ),
      seq(
        "(",
        $.pattern_element,
        ")"
      )
    ),
    _pattern_element_chain: $ => seq($._relationship_pattern, $.node_pattern),
    _relationship_pattern: $ => choice(
      seq("<-", optional($.relationship_detail), "->"),
      seq("<-", optional($.relationship_detail), "-"),
      seq("-", optional($.relationship_detail), "->"),
      seq("-", optional($.relationship_detail), "-"),
    ),
    relationship_detail: $ => seq(
      "[",
      optional($.variable),
      optional($.relationship_types),
      "]"
    ),
    relationship_types: $ => seq(
      ":",
      $.rel_type_name,
      repeat(
        seq(
          "|",
          optional(":"),
          $.rel_type_name
        )
      )
    ),
    rel_type_name: $ => $._schema_name,
    node_pattern: $ => seq(
      "(",
      optional($.variable),
      optional($.node_labels),
      optional($.properties),
      ")"
    ),
    node_labels: $ => seq($.node_label, repeat($.node_label)),
    node_label: $ => seq(":", $.label_name),
    label_name: $ => $._schema_name,
    properties: $ => choice(
      $.map_literal,
      // $.parameter
    ),
    map_literal: $ => seq(
      "{",
      optional(
        seq(
          $.property_key_name,
          ":",
          $.expression,
          repeat(
            seq(
              ",",
              $.property_key_name,
              ":",
              $.expression
            )
          )
        )
      ),
      "}"
    ),
    where: $ => seq("WHERE", $.expression),

    _updating_clause: $ => choice(
      $.create
    ),
    create: $ => seq("CREATE", $._pattern),

    return: $ => seq(
      "RETURN",
      seq($._projection_items)
    ),
    _projection_items: $ => choice(
      seq($._projection_item, repeat(seq(",", $._projection_item)))
    ),
    _projection_item: $ => choice(
      $.expression
    ),
    expression: $ => choice(
      seq(
        $._atom,
        repeat($.property_lookup),
        "IN",
        $.list
      ),
      prec.left(2, seq($.expression, "AND", $.expression)),
      seq($._atom, repeat($.property_lookup)),
      prec.left(seq($.expression, /[+-]/, $.expression)),
      prec.left(2, seq($.expression, /[\*\/%]/, $.expression)),
      prec.left(seq("NOT", $.expression)),
      prec.left(seq($.expression, "AND", $.expression)),
      prec.left(2, seq($.expression, "XOR", $.expression)),
      prec.left(3, seq($.expression, "OR", $.expression)),
      prec.left(4, seq($.expression, "=~", $.expression)),
      prec.left(4, seq($.expression, "=", $.expression))
    ),
    list: $ => seq(
      "[",
      $.expression,
      repeat(
        seq(
          ",",
          $.expression
        )
      ),
      "]"
    ),
    property_lookup: $ => seq(".", $.property_key_name),
    property_key_name: $ => $._schema_name,
    _schema_name: $ => $._symbolic_name,
    _atom: $ => choice(
      $._literal,
      $.variable,
      $.function_invocation,
      $.parameter,
    ),
    parameter: $ => seq(
      "$",
      $._symbolic_name
    ),
    function_invocation: $ => seq(
      $.function_name,
      "(",
      // optional DISTINCT
      // make args optional
      $.expression,
      repeat(
        seq(
          ",",
          $.expression
        )
      ),
      ")"
    ),
    function_name: $ => seq(
      $._symbolic_name
    ),
    _literal: $ => choice(
      $.decimal_integer_literal,
      $.string_literal
    ),
    decimal_integer_literal: $ => /(0|[1-9][0-9]*)/,
    string_literal: $ => choice(
      seq(
        "'",
        /[^'\\]*/,
        "'"
      ),
      seq(
        '"',
        /[^"\\]*/,
        '"'
      )
    ),
    variable: $ => $._symbolic_name,
    _symbolic_name: $ => $.identifier,
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  }
});
