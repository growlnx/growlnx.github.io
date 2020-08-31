---
layout: post
title: Unauth RCE no Wordpress File Manager
permalink: /web/urce-wp-file-manager
---

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

Normalente para aumentar a velocidade do fuzzing, eu reduzo o delay e aumento a quantidade threads.

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

![](/imgs/urce-wp-file-manager/PoC_python.png)

E tive uma surpresa, é permitido o upload de arquivos arbritrários no servidor.

![](/imgs/urce-wp-file-manager/file_upload_clear.png)

![](/imgs/urce-wp-file-manager/backdoor_upload_exec.png)

![](/imgs/urce-wp-file-manager/file_upload_not_clear.png)

Confirmando que consigo realizar o upload de uma webshell, testei se realmente ocorre a interpretação do arquivo PHP ou se há alguma proteção para ser bypassada.

![](/imgs/urce-wp-file-manager/RCE.png)

A webshell "b4ckd00r.php" foi interpretada com sucesso pelo servidor e *voilà*!, **Unauth RCE** :smirk:.