-- Delete duplicate saints, keeping the one with more complete data (image/description)

-- San Antonio de Padua: keep 1baff88e (has_description), delete 96d15750
DELETE FROM calendar_saints WHERE id = '96d15750-6bc6-4870-abbe-9d14da3976f0';

-- San Benito de Nursia: keep 621e1d0c (has_description), delete 584ec947
DELETE FROM calendar_saints WHERE id = '584ec947-8ca8-468c-a16a-f0601566adf3';

-- San Bonifacio: keep 9796ddeb (has_image + has_description, patron DE), delete b5426df6
DELETE FROM calendar_saints WHERE id = 'b5426df6-1280-47ad-9992-4511a7a818e2';

-- San Casimiro: keep 751e5708 (has_image + has_description, patron LT), delete ecccad10
DELETE FROM calendar_saints WHERE id = 'ecccad10-a13b-4924-af87-325606a15601';

-- San David de Gales: keep 7e50e9c6 (has_image + has_description, patron GB-WLS), delete df8c4565
DELETE FROM calendar_saints WHERE id = 'df8c4565-abde-47fb-b16c-01dc0154782d';

-- San Esteban de Hungría: keep a7af5320 (has_image + has_description, patron HU), delete 4a45b1fd
DELETE FROM calendar_saints WHERE id = '4a45b1fd-6c0a-4491-bbd2-a87dc1ef330f';

-- San Francisco de Asís: keep 19ace8a4 (has_image + has_description, patron IT), delete 679a64bd
DELETE FROM calendar_saints WHERE id = '679a64bd-6862-4c74-9d05-78196b42f6b1';

-- San Jorge: keep 6088dc74 (optional_memorial), delete b54d595e (both incomplete, keep first)
DELETE FROM calendar_saints WHERE id = 'b54d595e-c559-4d39-ac95-4ad70553716a';

-- San Marcos Evangelista: keep 8909d97c (has_image + has_description, patron EG), delete 8a2b84a3
DELETE FROM calendar_saints WHERE id = '8a2b84a3-d72d-49e8-830b-df5028e06079';

-- San Patricio: keep c0369370 (has_image + has_description, patron IE), delete 9836ae33
DELETE FROM calendar_saints WHERE id = '9836ae33-8341-4db7-8af2-ecfd8a56d8e9';

-- San Pedro Canisio: both incomplete, keep 989836e3 (first), delete 08878031
DELETE FROM calendar_saints WHERE id = '08878031-9ef3-4265-83a0-983c2602fddd';

-- Santa Brígida de Suecia: keep 771eb14b (has_image + has_description, patron SE), delete f33d27ed
DELETE FROM calendar_saints WHERE id = 'f33d27ed-2dcf-40ce-a2c2-d4b0658edf61';

-- Santa Juana de Arco: keep f8f88140 (has_image + has_description, patron FR), delete 8407cc89
DELETE FROM calendar_saints WHERE id = '8407cc89-6107-4623-8928-e05d9997819f';

-- Santa Rita de Casia: both incomplete, keep 195e467e (first), delete 96997ab9
DELETE FROM calendar_saints WHERE id = '96997ab9-fbb6-4220-beb1-ac226662a6f0';

-- Santa Rosa de Lima: keep d2af02bd (has_image + has_description, patron PE), delete 7262cef7
DELETE FROM calendar_saints WHERE id = '7262cef7-a6da-4bed-9e0a-5fae8408a76f';

-- Santa Rosa de Viterbo: both incomplete, keep 6e73da5b (first), delete 3cf235c7
DELETE FROM calendar_saints WHERE id = '3cf235c7-dd94-4d93-bbb3-37f9d08f3f3b';

-- Santiago Apóstol: keep 12e29c61 (has_image + has_description, patron ES), delete a8624383
DELETE FROM calendar_saints WHERE id = 'a8624383-653b-4aec-9b71-be4d036e5a5b';