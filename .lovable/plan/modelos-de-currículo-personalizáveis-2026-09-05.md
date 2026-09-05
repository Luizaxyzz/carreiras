# Modelos de currículo personalizáveis

## Objetivo
Substituir seis modelos atuais pelas referências enviadas e permitir que cada pessoa personalize o currículo antes de exportar.

## O que será feito
- Manter os modelos **Minimal** e **Classic** atuais.
- Recriar **Clean, Compact, Executive, Modern, Professional e Tech** com a composição visual das imagens enviadas, usando somente texto e elementos editáveis (as imagens serão referência, não serão inseridas no currículo).
- Atualizar as miniaturas da galeria para mostrar o desenho real de cada modelo.
- Adicionar um painel de personalização com:
  - cor principal por seletor visual e escolha livre;
  - fonte entre opções profissionais e compatíveis com leitura digital;
  - tamanho do texto;
  - espaçamento compacto, equilibrado ou amplo;
  - opção de exibir ou ocultar detalhes decorativos.
- Aplicar as mudanças imediatamente na visualização e também no PDF impresso.
- Preservar todos os dados reais do currículo e a legibilidade para sistemas ATS.

## Detalhes técnicos
- Criar configurações tipadas de aparência e passá-las para a visualização e miniaturas.
- Implementar layouts distintos para modelos de uma e duas colunas, sem transformar texto em imagem.
- Usar variáveis locais de estilo apenas para os valores escolhidos pelo usuário (cor, fonte, escala e espaçamento).
- Ajustar a folha de impressão para manter a página A4 e suas cores.
- Validar a página em desktop e celular, seleção de modelos, controles e impressão.
