public class MaskProcessor {

    // Main method to process the mask
    public static String processMask(String mask, Map<String, String> queries) {
        // 1. Execute queries and fetch records
        Map<String, List<SObject>> recordsByObject = executeQueries(queries);

        // 2. Process the mask with the fetched records
        mask = processLoops(mask, recordsByObject);
        mask = processPlaceholders(mask, recordsByObject);
        mask = evaluateConditionals(mask, recordsByObject);

        return mask;
    }

    // Executes the provided queries
    private static Map<String, List<SObject>> executeQueries(Map<String, String> queries) {
        Map<String, List<SObject>> recordsByObject = new Map<String, List<SObject>>();

        for (String objectName : queries.keySet()) {
            String query = queries.get(objectName);
            recordsByObject.put(objectName, Database.query(query));
        }

        return recordsByObject;
    }

    // Replaces simple placeholders in the mask
    private static String processPlaceholders(String mask, Map<String, List<SObject>> recordsByObject) {
        for (String objectName : recordsByObject.keySet()) {
            for (SObject record : recordsByObject.get(objectName)) {
                for (Schema.SObjectField field : record.getSObjectType().getDescribe().fields.getMap().values()) {
                    String fieldName = field.getDescribe().getName();
                    String fieldValue = record.get(fieldName) != null ? String.valueOf(record.get(fieldName)) : '';
                    mask = mask.replace('{' + objectName + '.' + fieldName + '}', fieldValue);
                }
            }
        }
        return mask;
    }

    // Processes loops defined in the mask
    private static String processLoops(String mask, Map<String, List<SObject>> recordsByObject) {
        Pattern loopRegex = Pattern.compile('\\{#(\\w+):(\\{.+?\\})\\}');
        Matcher matcher = loopRegex.matcher(mask);

        while (matcher.find()) {
            String objectName = matcher.group(1).trim();
            String block = matcher.group(2).trim();

            if (!recordsByObject.containsKey(objectName)) {
                mask = mask.replace(matcher.group(0), '');
                continue;
            }

            StringBuilder loopResult = new StringBuilder();
            for (SObject record : recordsByObject.get(objectName)) {
                String processedBlock = block;
                for (Schema.SObjectField field : record.getSObjectType().getDescribe().fields.getMap().values()) {
                    String fieldName = field.getDescribe().getName();
                    String fieldValue = record.get(fieldName) != null ? String.valueOf(record.get(fieldName)) : '';
                    processedBlock = processedBlock.replace('{' + objectName + '.' + fieldName + '}', fieldValue);
                }
                loopResult.append(processedBlock).append(',');
            }

            if (loopResult.length() > 0 && loopResult.charAt(loopResult.length() - 1) == ',') {
                loopResult.deleteCharAt(loopResult.length() - 1);
            }

            mask = mask.replace(matcher.group(0), loopResult.toString());
        }

        return mask;
    }

    // Evaluates and processes conditionals
    private static String evaluateConditionals(String mask, Map<String, List<SObject>> recordsByObject) {
        Pattern conditionalRegex = Pattern.compile('\\{\\?([^:]+):(\\{.+?\\})\\}');
        Matcher matcher = conditionalRegex.matcher(mask);

        while (matcher.find()) {
            String condition = matcher.group(1).trim();
            String block = matcher.group(2).trim();

            boolean conditionResult = false;

            for (String objectName : recordsByObject.keySet()) {
                for (SObject record : recordsByObject.get(objectName)) {
                    conditionResult = evaluateCondition(condition, record);
                    if (conditionResult) {
                        break;
                    }
                }
            }

            mask = conditionResult ? mask.replace(matcher.group(0), block) : mask.replace(matcher.group(0), '');
        }

        return mask;
    }

    // Evaluates an individual condition
    private static Boolean evaluateCondition(String condition, SObject record) {
        List<String> parts;

        if (condition.contains('=')) {
            parts = condition.split('=');
        } else if (condition.contains('!=')) {
            parts = condition.split('!=');
        } else {
            throw new IllegalArgumentException('Malformed condition: ' + condition);
        }

        String fieldName = parts[0].trim();
        String expectedValue = parts[1].trim().replace('\'', '');
        Object actualValue = record.get(fieldName);

        if (condition.contains('!=')) {
            return !String.valueOf(expectedValue).equals(String.valueOf(actualValue));
        }
        return String.valueOf(expectedValue).equals(String.valueOf(actualValue));
    }
}
