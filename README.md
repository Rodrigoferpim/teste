/**
     * Avalia uma condição dinâmica.
     */
    private static Boolean evaluateCondition(String condition, SObject record) {
        Map<String, Object> recordValues = extractFieldValues(record);

        // Identificar se a condição é simples ou complexa
        if (isSimpleCondition(condition)) {
            return evaluateSimpleCondition(condition, recordValues);
        } else {
            // Avaliar a expressão condicional complexa
            return evaluateLogicalExpression(condition, recordValues);
        }
    }

    /**
     * Extrai os valores dos campos do registro.
     */
    private static Map<String, Object> extractFieldValues(SObject record) {
        Map<String, Object> fieldValues = new Map<String, Object>();
        for (String field : record.getSObjectType().getDescribe().fields.getMap().keySet()) {
            fieldValues.put(field, record.get(field));
        }
        return fieldValues;
    }

    /**
     * Identifica se a condição é simples (ex.: "Field = Value").
     */
    private static Boolean isSimpleCondition(String condition) {
        // Uma condição simples não deve conter operadores lógicos ou parênteses
        return !condition.contains('AND') && !condition.contains('OR') && !condition.contains('(') && !condition.contains(')');
    }

    /**
     * Avalia uma condição simples (exemplo: "Field = Value").
     */
    private static Boolean evaluateSimpleCondition(String condition, Map<String, Object> recordValues) {
        List<String> parts;

        // Suporte para operadores =, !=
        if (condition.contains('=')) {
            parts = condition.split('=');
            return recordValues.get(parts[0].trim()) == parts[1].trim().replaceAll("'", '');
        } else if (condition.contains('!=')) {
            parts = condition.split('!=');
            return recordValues.get(parts[0].trim()) != parts[1].trim().replaceAll("'", '');
        }

        return false;
    }

    /**
     * Avalia expressões lógicas, incluindo operadores AND, OR, e parênteses.
     */
    private static Boolean evaluateLogicalExpression(String expression, Map<String, Object> recordValues) {
        expression = expression.replaceAll('\\s+', ' '); // Remover espaços extras

        // Resolver parênteses primeiro
        while (expression.contains('(')) {
            expression = resolveParentheses(expression, recordValues);
        }

        // Resolver operadores AND e OR
        return resolveOperators(expression, recordValues);
    }

    /**
     * Resolve expressões dentro de parênteses.
     */
    private static String resolveParentheses(String expression, Map<String, Object> recordValues) {
        Pattern pattern = Pattern.compile('\\(([^()]+)\\)');
        Matcher matcher = pattern.matcher(expression);

        while (matcher.find()) {
            String innerExpression = matcher.group(1);
            Boolean result = resolveOperators(innerExpression, recordValues);
            expression = expression.replace('(' + innerExpression + ')', String.valueOf(result));
        }
        return expression;
    }

    /**
     * Resolve operadores lógicos AND e OR.
     */
    private static Boolean resolveOperators(String expression, Map<String, Object> recordValues) {
        // Resolver operadores AND primeiro
        while (expression.contains('AND')) {
            List<String> parts = expression.split('AND', 2);
            Boolean left = evaluateSimpleCondition(parts[0].trim(), recordValues);
            Boolean right = evaluateSimpleCondition(parts[1].trim(), recordValues);
            expression = expression.replace(parts[0] + ' AND ' + parts[1], String.valueOf(left && right));
        }

        // Resolver operadores OR
        while (expression.contains('OR')) {
            List<String> parts = expression.split('OR', 2);
            Boolean left = evaluateSimpleCondition(parts[0].trim(), recordValues);
            Boolean right = evaluateSimpleCondition(parts[1].trim(), recordValues);
            expression = expression.replace(parts[0] + ' OR ' + parts[1], String.valueOf(left || right));
        }

        return Boolean.valueOf(expression);
    }
