/**
 * Examples and Tests for Prompt Generator
 *
 * This file contains real-world usage examples and validation tests
 * for the prompt generation system.
 */

import {
  generateUniversalPrompt,
  validateUserContext,
  validateSector,
  getPromptPreview,
  type AgentConfig,
  type ExtendedSector,
  type UserContext,
  type GeneratedPrompt
} from './prompt-generator'

// =============================================
// MOCK DATA FOR EXAMPLES
// =============================================

/**
 * Example sector: Événementiel
 */
const EVENEMENTIEL_SECTOR: ExtendedSector = {
  id: '1',
  name: 'Événementiel',
  slug: 'evenementiel',
  description: 'Organisateur d\'événements, wedding planner, traiteur événementiel',
  icon: '🎉',
  color: '#ec4899',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  base_expertise: `Tu es un expert en organisation d'événements avec plus de 10 ans d'expérience.

Tu maîtrises:
- La planification et coordination d'événements (mariages, séminaires, conférences, soirées d'entreprise)
- La gestion de budgets événementiels et négociation avec prestataires
- Le timing et la logistique (planning détaillé, rétroplanning, checklist)
- La relation client et le conseil personnalisé
- La gestion de crise et résolution de problèmes de dernière minute
- Les tendances actuelles en décoration, restauration et animation

Tu es organisé, réactif, créatif et tu as le sens du détail. Tu sais gérer le stress et jongler entre plusieurs projets simultanément.`,
  common_tasks: [
    'Rédiger des devis et propositions commerciales',
    'Créer des plannings et rétroplannings détaillés',
    'Gérer les listes d\'invités et le seating plan',
    'Négocier avec les prestataires (traiteur, décorateur, DJ)',
    'Rédiger des briefs pour les fournisseurs',
    'Calculer et optimiser les budgets',
    'Créer des comptes-rendus de réunion client',
    'Gérer les urgences et imprévus le jour J'
  ],
  legal_context: `Obligations légales:
- ERP (Établissement Recevant du Public): respect des normes de sécurité et capacité d'accueil
- Assurances: responsabilité civile professionnelle obligatoire, assurance annulation recommandée
- SACEM: déclaration et paiement des droits d'auteur si diffusion musicale
- Autorisations préfectorales pour événements sur la voie publique
- Respect du droit du travail pour le personnel événementiel
- CGV (Conditions Générales de Vente) claires avec clauses d'annulation`
}

/**
 * Example sector: Marketing
 */
const MARKETING_SECTOR: ExtendedSector = {
  id: '4',
  name: 'Marketing',
  slug: 'marketing',
  description: 'Consultant marketing, traffic manager, growth hacker',
  icon: '📈',
  color: '#f59e0b',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  base_expertise: `Tu es un expert en marketing digital et stratégie de croissance avec une vision 360°.

Tu maîtrises:
- Le marketing digital (SEO, SEA, Social Ads, Email marketing)
- La stratégie de contenu et copywriting
- L'analyse de données et web analytics (Google Analytics, Data Studio)
- Le growth hacking et l'acquisition client`,
  common_tasks: [
    'Créer des stratégies marketing digitales',
    'Rédiger des contenus web et newsletters',
    'Optimiser les campagnes publicitaires (Google Ads, Meta Ads)',
    'Analyser les performances et créer des rapports'
  ],
  legal_context: `Obligations légales:
- RGPD: consentement obligatoire pour collecte de données personnelles
- Cookies: bandeau de consentement obligatoire
- Email marketing: opt-in obligatoire, lien de désinscription`
}

// =============================================
// EXAMPLE 1: Freelance Wedding Planner (Generic, Friendly)
// =============================================

export function example1_FreelanceWeddingPlanner(): GeneratedPrompt {
  console.log('\n=== EXEMPLE 1: Wedding Planner Freelance ===\n')

  const userContext: UserContext = {
    userName: 'Marie Dubois',
    company_type: 'freelance',
    target_customers: 'Couples cherchant un mariage haut de gamme en Île-de-France',
    company_specifics: 'Spécialité dans les mariages bohème-chic et les décors champêtres'
  }

  const config: AgentConfig = {
    sector: EVENEMENTIEL_SECTOR,
    userContext,
    tone: 'friendly',
    agentType: 'generic'
  }

  const prompt = generateUniversalPrompt(config)

  console.log('📊 Metadata:')
  console.log(`   Secteur: ${prompt.metadata.secteur}`)
  console.log(`   Tokens estimés: ${prompt.metadata.tokens}`)
  console.log(`   Version: ${prompt.metadata.version}`)
  console.log('\n📝 Preview:')
  console.log(getPromptPreview(prompt))
  console.log('\n[SUCCESS] Prompt complet généré avec succès!\n')

  return prompt
}

// =============================================
// EXAMPLE 2: PME Marketing Agency (Professional)
// =============================================

export function example2_MarketingAgency(): GeneratedPrompt {
  console.log('\n=== EXEMPLE 2: Agence Marketing PME ===\n')

  const userContext: UserContext = {
    userName: 'Thomas Martin',
    company_type: 'pme',
    target_customers: 'PME B2B dans le secteur tech et SaaS',
    company_specifics: 'Focus sur le growth marketing et l\'acquisition digitale, équipe de 12 personnes'
  }

  const config: AgentConfig = {
    sector: MARKETING_SECTOR,
    userContext,
    tone: 'professional',
    agentType: 'generic'
  }

  const prompt = generateUniversalPrompt(config)

  console.log('📊 Metadata:')
  console.log(`   Secteur: ${prompt.metadata.secteur}`)
  console.log(`   Tokens estimés: ${prompt.metadata.tokens}`)
  console.log(`   Version: ${prompt.metadata.version}`)
  console.log('\n📝 Preview:')
  console.log(getPromptPreview(prompt))
  console.log('\n[SUCCESS] Prompt complet généré avec succès!\n')

  return prompt
}

// =============================================
// EXAMPLE 3: TPE Event Planner (Expert Tone)
// =============================================

export function example3_ExpertEventPlanner(): GeneratedPrompt {
  console.log('\n=== EXEMPLE 3: Organisateur Événements TPE (Ton Expert) ===\n')

  const userContext: UserContext = {
    company_type: 'tpe',
    target_customers: 'Entreprises pour événements corporate (séminaires, conférences, team building)',
    company_specifics: 'Spécialisation dans les événements pour startups et scale-ups tech'
  }

  const config: AgentConfig = {
    sector: EVENEMENTIEL_SECTOR,
    userContext,
    tone: 'expert',
    agentType: 'generic'
  }

  const prompt = generateUniversalPrompt(config)

  console.log('📊 Metadata:')
  console.log(`   Secteur: ${prompt.metadata.secteur}`)
  console.log(`   Tokens estimés: ${prompt.metadata.tokens}`)
  console.log(`   Version: ${prompt.metadata.version}`)
  console.log('\n📝 Preview:')
  console.log(getPromptPreview(prompt))
  console.log('\n[SUCCESS] Prompt complet généré avec succès!\n')

  return prompt
}

// =============================================
// EXAMPLE 4: Specialized Agent with Template
// =============================================

export function example4_SpecializedAgent(): GeneratedPrompt {
  console.log('\n=== EXEMPLE 4: Agent Spécialisé (Template) ===\n')

  const userContext: UserContext = {
    userName: 'Sophie Laurent',
    company_type: 'freelance',
    target_customers: 'Particuliers pour mariages et baptêmes',
    company_specifics: 'Focus sur la décoration florale et l\'ambiance vintage'
  }

  // Mock template for a specialized "Budget Calculator" agent
  const mockTemplate = {
    id: 't1',
    sector_id: '1',
    name: 'Calculateur de Budget Événementiel',
    description: 'Agent spécialisé dans le calcul et l\'optimisation de budgets',
    system_prompt: `# IDENTITÉ
Tu es le "Calculateur de Budget" de {{user_name}}, agent spécialisé en gestion budgétaire événementielle pour le secteur {{sector_name}}.

# MISSION SPÉCIFIQUE
Ta mission principale est d'aider {{user_name}} à:
- Calculer des budgets précis pour les événements
- Optimiser les coûts et identifier les économies possibles
- Comparer les devis de prestataires
- Créer des tableaux de suivi budgétaire

# CLIENTÈLE
Clients cibles: {{target_customers}}
Type d'entreprise: {{company_type}}

# EXPERTISE
{{company_specifics}}

Tu es méticuleux, analytique et tu sais rendre les chiffres compréhensibles pour tes clients.`,
    suggested_tasks: ['Calculer un budget', 'Optimiser les coûts', 'Comparer des devis'],
    default_model: 'claude' as const,
    icon: '💰',
    is_featured: false,
    required_tier: 'free' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const config: AgentConfig = {
    sector: EVENEMENTIEL_SECTOR,
    userContext,
    tone: 'professional',
    agentType: 'specialized',
    template: mockTemplate
  }

  const prompt = generateUniversalPrompt(config)

  console.log('📊 Metadata:')
  console.log(`   Secteur: ${prompt.metadata.secteur}`)
  console.log(`   Tokens estimés: ${prompt.metadata.tokens}`)
  console.log(`   Version: ${prompt.metadata.version}`)
  console.log('\n📝 Preview:')
  console.log(getPromptPreview(prompt))
  console.log('\n[SUCCESS] Prompt spécialisé généré avec succès!\n')

  return prompt
}

// =============================================
// VALIDATION TESTS
// =============================================

/**
 * Test suite for validation functions
 */
export function runValidationTests(): void {
  console.log('\n=== TESTS DE VALIDATION ===\n')

  // Test 1: Valid user context
  try {
    const validContext: UserContext = {
      company_type: 'freelance',
      target_customers: 'Clients B2B'
    }
    validateUserContext(validContext)
    console.log('[SUCCESS] Test 1 passé: Contexte utilisateur valide')
  } catch (error) {
    console.error('[ERROR] Test 1 échoué:', error)
  }

  // Test 2: Invalid user context (missing target_customers)
  try {
    const invalidContext: UserContext = {
      company_type: 'freelance',
      target_customers: ''
    }
    validateUserContext(invalidContext)
    console.error('[ERROR] Test 2 échoué: Devrait rejeter un target_customers vide')
  } catch (error) {
    console.log('[SUCCESS] Test 2 passé: target_customers vide correctement rejeté')
  }

  // Test 3: Valid sector
  try {
    validateSector(EVENEMENTIEL_SECTOR)
    console.log('[SUCCESS] Test 3 passé: Secteur valide')
  } catch (error) {
    console.error('[ERROR] Test 3 échoué:', error)
  }

  // Test 4: Invalid sector (missing name)
  try {
    const invalidSector = { ...EVENEMENTIEL_SECTOR, name: '', slug: '' }
    validateSector(invalidSector)
    console.error('[ERROR] Test 4 échoué: Devrait rejeter un secteur sans nom')
  } catch (error) {
    console.log('[SUCCESS] Test 4 passé: Secteur invalide correctement rejeté')
  }

  // Test 5: Missing template for specialized agent
  try {
    const configWithoutTemplate: AgentConfig = {
      sector: EVENEMENTIEL_SECTOR,
      userContext: {
        company_type: 'freelance',
        target_customers: 'Test'
      },
      tone: 'professional',
      agentType: 'specialized'
      // Missing template!
    }
    generateUniversalPrompt(configWithoutTemplate)
    console.error('[ERROR] Test 5 échoué: Devrait exiger un template pour agent spécialisé')
  } catch (error) {
    console.log('[SUCCESS] Test 5 passé: Template manquant correctement détecté')
  }

  console.log('\n=== FIN DES TESTS ===\n')
}

// =============================================
// RUN ALL EXAMPLES
// =============================================

/**
 * Runs all examples and displays generated prompts
 */
export function runAllExamples(): void {
  console.log('\n'.repeat(2))
  console.log('╔════════════════════════════════════════════════════════════════╗')
  console.log('║                                                                ║')
  console.log('║          EXEMPLES GÉNÉRATEUR DE PROMPTS YAYA.IA              ║')
  console.log('║                                                                ║')
  console.log('╚════════════════════════════════════════════════════════════════╝')

  // Run examples
  const prompt1 = example1_FreelanceWeddingPlanner()
  const prompt2 = example2_MarketingAgency()
  const prompt3 = example3_ExpertEventPlanner()
  const prompt4 = example4_SpecializedAgent()

  // Run validation tests
  runValidationTests()

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗')
  console.log('║                        RÉSUMÉ                                  ║')
  console.log('╚════════════════════════════════════════════════════════════════╝\n')
  console.log(`Total d'exemples générés: 4`)
  console.log(`Tokens moyens par prompt: ${Math.round((prompt1.metadata.tokens + prompt2.metadata.tokens + prompt3.metadata.tokens + prompt4.metadata.tokens) / 4)}`)
  console.log('\n✨ Tous les exemples ont été générés avec succès!\n')
}

// =============================================
// USAGE GUIDE
// =============================================

/**
 * Displays usage guide
 */
export function displayUsageGuide(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    GUIDE D'UTILISATION                         ║
╚════════════════════════════════════════════════════════════════╝

📦 IMPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { generateUniversalPrompt } from '@/lib/llm/prompt-generator'

💡 UTILISATION BASIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const config = {
  sector: sectorData,
  userContext: {
    userName: 'Marie',
    company_type: 'freelance',
    target_customers: 'Mariages haut de gamme',
    company_specifics: 'Spécialité bohème-chic'
  },
  tone: 'friendly',
  agentType: 'generic'
}

const result = generateUniversalPrompt(config)
console.log(result.systemPrompt)

🎯 TYPES DE TON DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 'professional' → Formel, structuré, vouvoiement
• 'friendly'     → Accessible, chaleureux, tutoiement
• 'expert'       → Technique, approfondi, jargon professionnel

🏢 TYPES D'ENTREPRISE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 'freelance' → Indépendant
• 'tpe'       → Très Petite Entreprise
• 'pme'       → Petite et Moyenne Entreprise

🤖 TYPES D'AGENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 'generic'      → Agent polyvalent (utilise base_expertise du secteur)
• 'specialized'  → Agent spécialisé (utilise un template prédéfini)

📋 FONCTIONS UTILITAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• validateUserContext(context)   → Valide les données utilisateur
• validateSector(sector)          → Valide les données secteur
• getPromptPreview(prompt)        → Aperçu des 200 premiers caractères

`)
}

// Auto-run examples if this file is executed directly
if (require.main === module) {
  displayUsageGuide()
  runAllExamples()
}
