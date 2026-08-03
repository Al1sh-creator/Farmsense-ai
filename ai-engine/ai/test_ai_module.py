"""
==========================================================
File: test_ai_module.py

What:
    Test script to verify the new AI architecture.

Why:
    To ensure RAG indexing, retrieval, and Ollama integration
    work as expected before pushing to production.
==========================================================
"""

import sys
import os
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farmsense.settings')
django.setup()

from ai.decision_engine.decision_engine import decision_engine

def run_tests():
    print("\n--- Starting AI Module Tests ---")

    # 1. Test Indexing & Retrieval Initializer
    print("\n[Test 1] Initializing RAG (Indexing)...")
    try:
        decision_engine.initialize_rag()
        print("[SUCCESS] RAG initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to initialize RAG: {e}")
        return

    # 2. Test Retrieval
    print("\n[Test 2] Testing Semantic Search...")
    test_query = "What diseases affect my crop?"
    try:
        # Notice we added target_crop to test the new filtering
        context = decision_engine.retriever.search(test_query, target_crop="Coffee")
        if context:
            print(f"[SUCCESS] Context retrieved successfully. Sample:\n{context[:200]}...")
        else:
            print("[WARN] No context retrieved.")
    except Exception as e:
        print(f"[ERROR] Retrieval failed: {e}")
        return

    # 3. Test Ollama Integration (Full Pipeline)
    print("\n[Test 3] Testing Full Decision Engine Pipeline...")
    dummy_ml_predictions = {
        "recommended_crop": "Coffee",
        "recommended_fertilizer": "Urea",
        "irrigation_need": "Medium",
        "predicted_yield": 4.5
    }
    dummy_weather = {
        "temperature": 25.5,
        "humidity": 60,
        "rainfall": 10.2
    }
    dummy_history = {
        "previous_crop": "Corn",
        "soil_type": "Loamy"
    }

    try:
        response = decision_engine.generate_recommendation(
            user_query=test_query,
            ml_predictions=dummy_ml_predictions,
            weather=dummy_weather,
            history=dummy_history
        )
        print("[SUCCESS] Full pipeline completed successfully.")
        print("\n--- AI Response ---")
        import json
        print(json.dumps(response, indent=2))
    except Exception as e:
        print(f"[ERROR] Full pipeline failed: {e}")

if __name__ == "__main__":
    run_tests()
