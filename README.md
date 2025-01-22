 // Método principal para processar regras
    public static void processRules(SObject record) {
        String objectName = record.getSObjectType().getDescribe().getName();

        // Consultar regras do metadado
        List<CustomMetadata__mdt> rules = [
            SELECT Nome_da_Regra__c, Condicao__c, Processamento__c, Ativo__c
            FROM CustomMetadata__mdt
            WHERE Objeto__c = :objectName AND Ativo__c = true
        ];

        for (CustomMetadata__mdt rule : rules) {
            if (evaluateCondition(rule.Condicao__c, record)) {
                executeProcessing(rule.Processamento__c, record);
            }
        }
    }

    // Avaliar condições dinâmicas com múltiplas regras
    private static Boolean evaluateCondition(String condition, SObject record) {
        // Substituir campos do registro na condição
        Map<String, Object> fieldValues = new Map<String, Object>();
        for (String field : record.getSObjectType().getDescribe().fields.getMap().keySet()) {
            fieldValues.put(field, record.get(field));
        }

        // Substituir os valores na condição
        for (String field : fieldValues.keySet()) {
            condition = condition.replace(field, '\'' + String.valueOf(fieldValues.get(field)) + '\'');
        }

        // Avaliar a expressão (usar um parser ou lógica personalizada)
        return evaluateLogicalExpression(condition);
    }

    // Método que avalia uma expressão lógica (simplificado)
    private static Boolean evaluateLogicalExpression(String expression) {
        // Lógica para avaliar a expressão (implementação personalizada necessária)
        // Exemplo: "Is_Active__c = true AND Status__c = 'New'"
        // Use bibliotecas de avaliação ou crie seu próprio parser.
        // Aqui, retorna true para simplificação:
        return Boolean.valueOf(expression.contains('true'));
    }

    private static Boolean evaluateLogicalExpression(String expression, Map<String, Object> recordValues) {
    // Remover espaços desnecessários
    expression = expression.replaceAll('\\s+', ' ');

    // Resolver expressões entre parênteses primeiro
    while (expression.contains('(')) {
        expression = resolveParentheses(expression, recordValues);
    }

    // Resolver operadores AND e OR
    return resolveOperators(expression, recordValues);
}

// Resolver expressões dentro de parênteses
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

// Resolver AND e OR
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

// Avaliar uma condição simples (campo = valor)
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
}
