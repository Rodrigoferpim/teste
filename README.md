
public class PreenchimentoMascara {

    // Método principal para processar a máscara
    public static String preencherMascara(String mascara, Map<String, String> queries) {
        // 1. Executar queries e obter registros
        Map<String, List<SObject>> registrosPorObjeto = executarQueries(queries);

        // 2. Processar a máscara com os registros obtidos
        mascara = processarLoops(mascara, registrosPorObjeto);
        mascara = processarPlaceholders(mascara, registrosPorObjeto);
        mascara = avaliarCondicionais(mascara, registrosPorObjeto);

        return mascara;
    }

    // Executa as queries fornecidas
    private static Map<String, List<SObject>> executarQueries(Map<String, String> queries) {
        Map<String, List<SObject>> registrosPorObjeto = new Map<String, List<SObject>>();

        for (String objeto : queries.keySet()) {
            String query = queries.get(objeto);
            registrosPorObjeto.put(objeto, Database.query(query));
        }

        return registrosPorObjeto;
    }

    // Substitui placeholders simples na máscara
    private static String processarPlaceholders(String mascara, Map<String, List<SObject>> registrosPorObjeto) {
        for (String objeto : registrosPorObjeto.keySet()) {
            for (SObject registro : registrosPorObjeto.get(objeto)) {
                for (Schema.SObjectField campo : registro.getSObjectType().getDescribe().fields.getMap().values()) {
                    String campoNome = campo.getDescribe().getName();
                    String valorCampo = registro.get(campoNome) != null ? String.valueOf(registro.get(campoNome)) : '';
                    mascara = mascara.replace('{' + objeto + '.' + campoNome + '}', valorCampo);
                }
            }
        }
        return mascara;
    }

    // Processa loops definidos na máscara
    private static String processarLoops(String mascara, Map<String, List<SObject>> registrosPorObjeto) {
        Pattern loopRegex = Pattern.compile('\\{#(\\w+):(\\{.+?\\})\\}');
        Matcher matcher = loopRegex.matcher(mascara);

        while (matcher.find()) {
            String objeto = matcher.group(1).trim();
            String bloco = matcher.group(2).trim();

            if (!registrosPorObjeto.containsKey(objeto)) {
                mascara = mascara.replace(matcher.group(0), '');
                continue;
            }

            StringBuilder resultadoLoop = new StringBuilder();
            for (SObject registro : registrosPorObjeto.get(objeto)) {
                String blocoProcessado = bloco;
                for (Schema.SObjectField campo : registro.getSObjectType().getDescribe().fields.getMap().values()) {
                    String campoNome = campo.getDescribe().getName();
                    String valorCampo = registro.get(campoNome) != null ? String.valueOf(registro.get(campoNome)) : '';
                    blocoProcessado = blocoProcessado.replace('{' + objeto + '.' + campoNome + '}', valorCampo);
                }
                resultadoLoop.append(blocoProcessado).append(',');
            }

            if (resultadoLoop.length() > 0 && resultadoLoop.charAt(resultadoLoop.length() - 1) == ',') {
                resultadoLoop.deleteCharAt(resultadoLoop.length() - 1);
            }

            mascara = mascara.replace(matcher.group(0), resultadoLoop.toString());
        }

        return mascara;
    }

    // Avalia e processa condicionais
    private static String avaliarCondicionais(String mascara, Map<String, List<SObject>> registrosPorObjeto) {
        Pattern condicionalRegex = Pattern.compile('\\{\\?([^:]+):(\\{.+?\\})\\}');
        Matcher matcher = condicionalRegex.matcher(mascara);

        while (matcher.find()) {
            String condicao = matcher.group(1).trim();
            String bloco = matcher.group(2).trim();

            boolean resultadoCondicao = false;

            for (String objeto : registrosPorObjeto.keySet()) {
                for (SObject registro : registrosPorObjeto.get(objeto)) {
                    resultadoCondicao = avaliarCondicao(condicao, registro);
                    if (resultadoCondicao) {
                        break;
                    }
                }
            }

            mascara = resultadoCondicao ? mascara.replace(matcher.group(0), bloco) : mascara.replace(matcher.group(0), '');
        }

        return mascara;
    }

    // Avalia uma condição individual
    private static Boolean avaliarCondicao(String condicao, SObject registro) {
        List<String> partes;

        if (condicao.contains('=')) {
            partes = condicao.split('=');
        } else if (condicao.contains('!=')) {
            partes = condicao.split('!=');
        } else {
            throw new IllegalArgumentException('Condicional mal formada: ' + condicao);
        }

        String campo = partes[0].trim();
        String valorEsperado = partes[1].trim().replace('\'', '');
        Object valorReal = registro.get(campo);

        if (condicao.contains('!=')) {
            return !String.valueOf(valorEsperado).equals(String.valueOf(valorReal));
        }
        return String.valueOf(valorEsperado).equals(String.valueOf(valorReal));
    }
}
