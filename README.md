 /**
     * Método principal para processar regras baseadas em metadados.
     */
    public static void processRules(SObject record) {
        String objectName = record.getSObjectType().getDescribe().getName();

        // Consulta ao metadado para obter regras ativas
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

    /**
     * Avalia uma condição dinâmica.
     */
    private static Boolean evaluateCondition(String condition, SObject record) {
        Map<String, Object> recordValues = extractFieldValues(record);

        // Avaliar a expressão condicional
        return evaluateLogicalExpression(condition, recordValues);
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
     * Executa o processamento definido no metadado.
     */
    private static void executeProcessing(String processingClass, SObject record) {
        if (!String.isBlank(processingClass)) {
            Type processorType = Type.forName(processingClass);
            if (processorType != null) {
                Object processorInstance = processorType.newInstance();
                processorType.getMethod('execute', new List<Type>{SObject.class}).invoke(processorInstance, new List<Object>{record});
            }
        }
    }
