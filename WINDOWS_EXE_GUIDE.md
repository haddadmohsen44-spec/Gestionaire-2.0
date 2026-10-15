# DentiDZ Pro - Guide de Génération de l'Exécutable Windows (.exe)

Ce document explique comment obtenir et exécuter **DentiDZ Pro** en tant qu'application de bureau Windows (.exe) autonome.

---

## Méthode 1 : Téléchargement automatique depuis GitHub (Sans rien installer sur votre PC)

Grâce au fichier de workflow GitHub Actions configuré dans `.github/workflows/build-windows-exe.yml`, GitHub compile automatiquement l'exécutable pour vous dans le cloud.

1. **Poussez votre code sur GitHub** (`git push origin main`).
2. Rendez-vous sur votre dépôt GitHub dans votre navigateur.
3. Cliquez sur l'onglet **"Actions"** en haut de la page.
4. Cliquez sur le workflow en cours ou terminé nommé **"Build Windows Executable (.exe)"**.
5. En bas de page, dans la section **"Artifacts"**, cliquez sur :
   - **`DentiDZ-Pro-Windows-Executable`**
6. Téléchargez et décompressez le fichier ZIP. Vous y trouverez :
   - `DentiDZ Pro Setup 1.0.0.exe` (Installateur officiel Windows avec raccourci sur le Bureau)
   - `DentiDZ Pro 1.0.0.exe` (Version Portable prête à l'emploi sur clé USB, sans installation requise)

---

## Méthode 2 : Lancement immédiat sur Windows (Zéro compilation requise)

Si vous avez téléchargé le dossier du projet sur un PC Windows :

- **Double-cliquez simplement sur le fichier `Lancer-DentiDZ-Pro.bat`**
- Cela ouvre directement DentiDZ Pro dans une fenêtre d'application indépendante et épurée (sans barre d'adresse ni onglets), identique à une application installée.

---

## Méthode 3 : Compilation locale du .EXE sur votre ordinateur Windows

Si vous disposez de [Node.js](https://nodejs.org/) installé sur votre PC :

1. Ouvrez le dossier du projet sur votre PC.
2. Double-cliquez sur **`Compiler-Windows-EXE.bat`** (ou exécutez dans un terminal : `npm run build:exe`).
3. Le script va générer automatiquement les exécutables dans le dossier `release/` :
   - `release/DentiDZ Pro Setup 1.0.0.exe`
   - `release/DentiDZ Pro.exe` (Portable)

---

## Fonctionnalités Windows de l'Application

- **100% Hors-Ligne (Offline) :** Ne nécessite aucune connexion Internet permanente. Toutes les données sont enregistrées localement sur le disque dur.
- **Impression Directe (Ctrl+P) :** Impression d'ordonnances médicales algériennes et de reçus de caisse aux formats A4, A5 ou thermique.
- **Réseau Local Multi-Postes :** Fonctionne en simultané sur le PC du Dentiste (salle de soin) et le PC de l'Assistante (réception) via Wi-Fi/LAN local.
- **Instance Unique Sécurisée :** Empêche d'ouvrir accidentellement plusieurs fenêtres en double.
