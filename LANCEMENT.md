# Suivi Devis — Guide de lancement

## Prérequis

- **Node.js 18+** — https://nodejs.org (télécharger LTS)
- **Navigateur web** (Chrome, Firefox, Edge)

## Installation en 5 étapes

### 1. Ouvrir un terminal dans le dossier du projet

```bash
cd /Users/jordan/Desktop/appli
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Initialiser la base de données

```bash
npm run db:push
```

### 4. Charger les données de démonstration

```bash
npm run db:seed
```

### 5. Lancer l'application

```bash
npm run dev
```

→ **Ouvrir http://localhost:3000 dans le navigateur**

---

## Comptes de démonstration

| Login       | Mot de passe   | Rôle              |
|-------------|----------------|-------------------|
| admin       | admin123       | Administrateur    |
| marco       | marco123       | Chargé d'affaires |
| albert      | albert123      | Chargé d'affaires |
| direction   | direction123   | Direction (lecture seule) |

---

## Structure des pages

| URL                   | Description                              | Accès            |
|-----------------------|------------------------------------------|------------------|
| `/dashboard`          | Tableau de bord principal + KPIs         | Tous             |
| `/devis`              | Liste filtrée de tous les devis          | Tous             |
| `/devis/nouveau`      | Formulaire de création                   | Admin + CA       |
| `/devis/{id}`         | Fiche détaillée d'un devis               | Tous             |
| `/devis/{id}/modifier`| Formulaire de modification               | Admin + CA       |
| `/relances`           | Devis sans retour > seuil (30j / 45j)    | Tous             |
| `/direction`          | Vue synthétique lecture seule            | Admin + Direction|
| `/parametres`         | Paramètres ROP et seuils                 | Admin uniquement |

---

## Variables d'environnement (.env.local)

Déjà pré-configuré pour le développement :

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="devis-tracker-secret-dev-2026-secure-key-32chars"
```

**Pour la production**, changer SESSION_SECRET par une valeur aléatoire longue.

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build
npm run start

# Explorer la base de données (interface visuelle)
npm run db:studio

# Réinitialiser les données de démo
npm run db:push --force-reset
npm run db:seed
```

---

## Export CSV

Sur la page `/devis`, bouton **"↓ Export CSV"** — exporte les devis filtrés.
Le fichier s'ouvre directement dans Excel (encodage UTF-8 BOM, séparateur `;`).

---

## Déploiement (exemple Railway.app)

1. Créer un compte sur https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Ajouter les variables d'environnement :
   - `DATABASE_URL=file:./prod.db`
   - `SESSION_SECRET=<valeur_aléatoire_longue>`
4. La commande de build est `npm run build` et de start `npm run start`

---

## Roadmap V2

- Authentification renforcée (LDAP / SSO Microsoft)
- Historique des modifications (journal d'audit)
- Notifications email pour les relances automatiques
- Import Excel automatisé (glisser-déposer le fichier Dashboard_Offres)
- Pièces jointes (devis PDF, bons de commande)
- Intégration SharePoint / Teams
- Workflow de validation (soumission → validation chef → envoi)
- Gestion des utilisateurs dans l'interface admin
- Tableau de bord interactif avec graphiques (Chart.js)
- Mode hors ligne (PWA)

---

## Hypothèses documentées

1. **ROP_corr** : Si ROP > 0.50 → ROP / 100 (correction saisie en %). Paramétrable dans /parametres
2. **Marge potentielle** = Montant × ROP_corr
3. **Reste à faire** = Montant - Montant réceptionné (min 0)
4. **Âge** = Aujourd'hui - Date remise d'offre (en jours ouvrables non calculés, jours calendaires)
5. **Relance** : s'applique sur les statuts ENVOYE et EN_ATTENTE uniquement
6. **Statut** : géré manuellement par le chargé d'affaires (pas de transition automatique)
7. **Base SQLite** : un fichier `dev.db` dans le dossier du projet. Sauvegarde = copier ce fichier
