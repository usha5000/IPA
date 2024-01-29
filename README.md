# IPA 2020

## Projektbeschrieb

Der Kandidat erstellt eine WEB-Plattform, welche es den Lernenden ermöglicht, die Lernjournale 
online zu erfassen.
Folgende Informationen werden durch die Lernenden erfasst:

• Datum des Eintrags

• Freier Text

• Fach 

Die Lehrperson, respektive der Ausbildner kann anschliessend den Eintrag kommentieren. Es können 
mehrere Lehrpersonen kommentieren. Der Kommentar wird eindeutig der betreffenden Lehrperson 
zugeordnet. Zu jedem Kommentar wird das Datum hinzugefügt.
Wurde der Eintrag des Lernenden kommentiert, darf dieser vom Lernenden nicht mehr mutiert oder 
gelöscht werden. Unkommentierte Beiträge dürfen vom Lernenden jederzeit geändert, oder gelöscht 
werden.
Die Lernenden können die Kommentare der Ausbildner nur lesen.
Eine Filterfunktion erleichtert das Auffinden von Einträgen. Folgende Filter müssen mindestens zur 
Verfügung stehen:

• Datum (von / bis)

• Lernender

• Fach

Die Filter können kombiniert werden. 
Ein entsprechendes Berechtigungskonzept muss erarbeitet werden. Die Implementation basiert auf 
einer LDAP Abfrage. Die Berechtigung wird über entsprechende Gruppen im ActiveDirectory geregelt. 
Der Benutzer für den LDAP Zugang ist eingerichtet und funktionstüchtig. Die Daten dazu 
(Benutzername und Passwort) sind dem Kandidaten bekannt.
