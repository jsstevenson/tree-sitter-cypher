module.exports = grammar({
  name: 'cypher',
  rules: {
    cypher: $ => seq($.query, optional(";")),
    query: $ => choice(
      seq(
        $.reading_clause,
        $.return
      ),
      seq(
        repeat($.reading_clause),
        repeat1($.updating_clause),
        optional($.return)
      )
    ),

    reading_clause: $ => choice(
      $.match
    ),
    match: $ => seq(
      "MATCH",
      $.pattern
    ),
    pattern: $ => $.pattern_element,
    pattern_element: $ => choice(
      seq(
        $.node_pattern,
        repeat($.pattern_element_chain),
      ),
      seq(
        "(",
        $.pattern_element,
        ")"
      )
    ),
    pattern_element_chain: $ => seq($.relationship_pattern, $.node_pattern),
    relationship_pattern: $ => choice(
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
    rel_type_name: $ => $.schema_name,
    node_pattern: $ => seq(
      "(",
      optional($.variable),
      optional($.node_labels),
      optional($.properties),
      ")"
    ),
    node_labels: $ => seq($.node_label, repeat($.node_label)),
    node_label: $ => seq(":", $.label_name),
    label_name: $ => $.schema_name,
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

    updating_clause: $ => choice(
      $.create
    ),
    create: $ => seq("CREATE", $.pattern),

    return: $ => seq(
      "RETURN",
      $.projection_body
    ),
    projection_body: $ => seq(
      $.projection_items
    ),
    projection_items: $ => choice(
      seq($.projection_item, repeat(seq(",", $.projection_item)))
    ),
    projection_item: $ => choice(
      $.expression
    ),
    expression: $ => choice(
      $.property_or_labels_expression,
    ),
    property_or_labels_expression: $ => seq(
      $.atom,
      repeat($.property_lookup),
    ),
    property_lookup: $ => seq(".", $.property_key_name),
    property_key_name: $ => $.schema_name,
    schema_name: $ => $._symbolic_name,
    atom: $ => choice(
      $.literal,
      $.variable
    ),
    literal: $ => choice(
      $.string_literal
    ),
    string_literal: $ => choice(
      seq(
        "'",
        /[^'\\]*/,
        "'"
      ),
    ),
    variable: $ => $._symbolic_name,
    _symbolic_name: $ => $.identifier,
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  }
});
