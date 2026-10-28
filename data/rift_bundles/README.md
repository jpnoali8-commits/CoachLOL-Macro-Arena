# Rift bundles — importação de máscaras reais (V4.5.2d-4-dev2)

Os seis JSON deste diretório **agora foram gerados** das máscaras e mapas `masks-and-maps(1).zip` fornecidos pelo usuário em 26/10/2026. Este README substitui a nota histórica do dev1 de que os arquivos ainda não existiam.

- `mountain.json`: deltas de parede/colisão sobre a máscara base; 33 adicionadas, 123 removidas.
- `ocean.json`: deltas de moitas/ocultação; 104 adicionadas, 18 removidas.
- `cloud.json`: quatro pontos de vento; influência por raio ainda aproximado.
- `hextech.json`: seis pares de Hexgate (12 pontas), canalização no motor.
- `chemtech.json`: dez frutas de estímulo e quinze Bloom de visão.
- `infernal.json`: sem deltas físicos; tingimento visual leve apenas.

Fonte e hashes: `../rift_user_manifest_v452d4.json`, script `../../tools/import_user_rift_maps_v452d4.py`. Todos são `NOT_CERTIFIED` para paridade Riot 1:1. Os PNGs/JPGs originais estão em `../../assets/user_rift_masks_20261026/`. Não alterar `../masks_128.json`, não trocar coordenadas para acomodar a arte e não usar Blender como dependência de execução.
