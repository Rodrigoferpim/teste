public class PropertyOwnerGrouper {

    public class Owner {
        public String name;
        public String cpfCnpj;

        public Owner(String name, String cpfCnpj) {
            this.name = name != null ? name.trim() : '';
            this.cpfCnpj = cpfCnpj != null ? cpfCnpj.trim() : '';
        }

        public String getKey() {
            return name + '|' + cpfCnpj;
        }
    }

    public static Map<String, List<Property__c>> groupByOwner(List<Property__c> properties) {
        Map<String, List<Property__c>> grouped = new Map<String, List<Property__c>>();

        for (Property__c property : properties) {
            List<String> names = cleanAndSplit(property.Owner_Names__c);
            List<String> documents = cleanAndSplit(property.Owner_Documents__c);

            Integer count = Math.min(names.size(), documents.size());
            List<String> ownerKeys = new List<String>();

            for (Integer i = 0; i < count; i++) {
                Owner owner = new Owner(names[i], documents[i]);
                ownerKeys.add(owner.getKey());
            }

            // Sort the keys to make the grouping order-independent
            ownerKeys.sort();
            String uniqueGroupKey = String.join(ownerKeys, ';');

            if (!grouped.containsKey(uniqueGroupKey)) {
                grouped.put(uniqueGroupKey, new List<Property__c>());
            }
            grouped.get(uniqueGroupKey).add(property);
        }

        return grouped;
    }

    private static List<String> cleanAndSplit(String raw) {
        if (String.isBlank(raw)) return new List<String>();

        List<String> parts = raw.split('/');
        List<String> cleaned = new List<String>();

        for (String part : parts) {
            String value = part != null ? part.trim() : '';
            if (!String.isBlank(value)) cleaned.add(value);
        }

        return cleaned;
    }
}
