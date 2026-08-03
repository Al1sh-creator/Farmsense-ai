// server/routes/analysis.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, requireProfile } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// ==============================================
// GET /api/analysis/latest
// Get latest AI analysis result for farm
// ==============================================
router.get('/latest', auth, requireProfile, async (req, res, next) => {
    try {
        // Get farm
        const farmResult = await pool.query(
            'SELECT id, current_season, last_ai_run FROM farms WHERE user_id = $1',
            [req.user.id]
        );

        if (farmResult.rows.length === 0) {
            throw new AppError('Farm not found', 404);
        }

        const farm = farmResult.rows[0];

        // Get latest analysis
        const result = await pool.query(
            `SELECT *
             FROM ai_analysis_results
             WHERE farm_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [farm.id]
        );

        // No analysis yet
        if (result.rows.length === 0) {
            return res.json({
                success: true,
                has_analysis: false,
                message: 'No analysis available yet. Run analysis first.',
                farm_id: farm.id,
                last_ai_run: farm.last_ai_run,
            });
        }

        const analysis = result.rows[0];

        res.json({
            success: true,
            has_analysis: true,
            last_ai_run: farm.last_ai_run,
            current_season: farm.current_season,
            analysis: {
                id: analysis.id,

                // Crop Recommendation
                crop_recommendation: {
                    recommended_crop:       analysis.recommended_crop,
                    suitability_score:      analysis.crop_suitability_score,
                    all_recommendations:    analysis.all_crop_recommendations,
                },

                // Fertilizer
                fertilizer_plan: {
                    recommended_fertilizer: analysis.recommended_fertilizer,
                    quantity:               analysis.fertilizer_quantity,
                    timing:                 analysis.fertilizer_timing,
                },

                // Irrigation
                irrigation_plan: {
                    irrigation_need:        analysis.irrigation_need,
                    water_amount_mm:        analysis.water_amount_mm,
                    next_irrigation_date:   analysis.next_irrigation_date,
                    frequency:              analysis.irrigation_frequency,
                },

                // Yield Prediction
                yield_prediction: {
                    yield_per_acre:         analysis.predicted_yield_per_acre,
                    total_yield:            analysis.total_predicted_yield,
                    confidence:             analysis.yield_confidence,
                },

                // Profit Estimate
                profit_estimate: {
                    market_price_per_quintal: analysis.market_price_per_quintal,
                    gross_revenue:            analysis.gross_revenue,
                    total_input_cost:         analysis.total_input_cost,
                    net_profit:               analysis.net_profit,
                    roi_percent:              analysis.roi_percent,
                },

                // Meta
                season:           analysis.season,
                weather_snapshot: analysis.weather_snapshot,
                created_at:       analysis.created_at,
            }
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// POST /api/analysis/run
// Manually trigger full AI pipeline
// (Django not ready yet — saves mock data)
// ==============================================
router.post('/run', auth, requireProfile, async (req, res, next) => {
    try {
        // Get farm with all details
        const farmResult = await pool.query(
            `SELECT * FROM farms WHERE user_id = $1`,
            [req.user.id]
        );

        if (farmResult.rows.length === 0) {
            throw new AppError('Farm not found', 404);
        }

        const farm = farmResult.rows[0];

        // Check farm has coordinates for weather
        if (!farm.latitude || !farm.longitude) {
            return res.status(400).json({
                success: false,
                error: 'Farm location coordinates not available. Please update your farm address.'
            });
        }

        // Check farm has soil profile for AI
        if (!farm.npk_nitrogen || !farm.npk_phosphorus ||
            !farm.npk_potassium || !farm.ph_level) {
            return res.status(400).json({
                success: false,
                error: 'Soil profile incomplete. Please add N, P, K and pH values.'
            });
        }

        const aiClient = require('../services/aiEngineClient');
        
        // Fetch weather
        let weatherForecast = [];
        try {
            weatherForecast = (await aiClient.getWeatherForecast(farm.latitude, farm.longitude)) || [];
        } catch(e) {
            console.error('Weather error during analysis:', e);
        }

        // Run AI pipeline
        const aiResult = await aiClient.generateSuggestions(farm, weatherForecast);
        const preds = aiResult.ml_predictions;

        const analysisData = {
            recommended_crop:          preds.recommended_crop || 'Unknown',
            crop_suitability_score:    0, // not provided by basic model
            all_crop_recommendations:  [{ crop: preds.recommended_crop, score: 100 }],
            recommended_fertilizer:    preds.recommended_fertilizer || 'Unknown',
            fertilizer_quantity:       'Based on AI recommendation',
            fertilizer_timing:         'Based on AI recommendation',
            irrigation_need:           preds.irrigation_need || 'Unknown',
            water_amount_mm:           0,
            next_irrigation_date:      new Date(Date.now() + 86400000).toISOString().split('T')[0],
            irrigation_frequency:      'AI recommended',
            predicted_yield_per_acre:  preds.predicted_yield || 0,
            total_predicted_yield:     (preds.predicted_yield || 0) * farm.farm_area,
            yield_confidence:          'high',
            market_price_per_quintal:  0, // Would come from price API
            gross_revenue:             0,
            total_input_cost:          0,
            net_profit:                0,
            roi_percent:               0,
            season:                    farm.current_season,
            weather_snapshot: {
                temp: weatherForecast?.[0]?.temp_max || 30,
                rainfall: weatherForecast?.[0]?.rainfall || 0,
                source: 'open-meteo'
            },
            full_analysis: aiResult
        };

        // Save analysis result to DB
        const saved = await pool.query(
            `INSERT INTO ai_analysis_results (
                farm_id,
                recommended_crop, crop_suitability_score,
                all_crop_recommendations,
                recommended_fertilizer, fertilizer_quantity,
                fertilizer_timing,
                irrigation_need, water_amount_mm,
                next_irrigation_date, irrigation_frequency,
                predicted_yield_per_acre, total_predicted_yield,
                yield_confidence,
                market_price_per_quintal, gross_revenue,
                total_input_cost, net_profit, roi_percent,
                season, weather_snapshot,
                full_analysis
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                $10, $11, $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21, $22
            ) RETURNING id, created_at`,
            [
                farm.id,
                analysisData.recommended_crop,
                analysisData.crop_suitability_score,
                JSON.stringify(analysisData.all_crop_recommendations),
                analysisData.recommended_fertilizer,
                analysisData.fertilizer_quantity,
                analysisData.fertilizer_timing,
                analysisData.irrigation_need,
                analysisData.water_amount_mm,
                analysisData.next_irrigation_date,
                analysisData.irrigation_frequency,
                analysisData.predicted_yield_per_acre,
                analysisData.total_predicted_yield,
                analysisData.yield_confidence,
                analysisData.market_price_per_quintal,
                analysisData.gross_revenue,
                analysisData.total_input_cost,
                analysisData.net_profit,
                analysisData.roi_percent,
                analysisData.season,
                JSON.stringify(analysisData.weather_snapshot),
                JSON.stringify(analysisData.full_analysis),
            ]
        );

        // Update last_ai_run in farms table
        await pool.query(
            `UPDATE farms
             SET last_ai_run = NOW()
             WHERE id = $1`,
            [farm.id]
        );

        // Generate actual textual AI suggestions for AI Suggestions table
        // Normally done in the background, but let's insert the LLM response as a suggestion
        await pool.query(
            `INSERT INTO ai_suggestions (
                farm_id, category, title, suggestion_text, priority, valid_for_date
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)`,
            [
                farm.id, 
                'all', 
                'FarmSense AI Daily Briefing', 
                aiResult.ai_recommendation, 
                'high'
            ]
        );

        res.json({
            success: true,
            message: 'AI analysis completed successfully',
            analysis_id: saved.rows[0].id,
            created_at: saved.rows[0].created_at,
            summary: {
                recommended_crop:  analysisData.recommended_crop,
                predicted_yield:   analysisData.predicted_yield_per_acre,
                irrigation_need:   analysisData.irrigation_need,
                fertilizer:        analysisData.recommended_fertilizer,
            }
        });

    } catch (err) {
        next(err);
    }
});

// ==============================================
// GET /api/analysis/history
// Get all past analysis results
// ==============================================
router.get('/history', auth, requireProfile, async (req, res, next) => {
    try {
        const farmResult = await pool.query(
            'SELECT id FROM farms WHERE user_id = $1',
            [req.user.id]
        );

        if (farmResult.rows.length === 0) {
            throw new AppError('Farm not found', 404);
        }

        const { limit = 10 } = req.query;

        const result = await pool.query(
            `SELECT
                id,
                recommended_crop,
                crop_suitability_score,
                irrigation_need,
                recommended_fertilizer,
                net_profit,
                roi_percent,
                season,
                created_at
             FROM ai_analysis_results
             WHERE farm_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [farmResult.rows[0].id, limit]
        );

        res.json({
            success: true,
            total: result.rows.length,
            history: result.rows
        });

    } catch (err) {
        next(err);
    }
});

// POST /api/analysis/trigger-job
// Manually trigger daily job for testing
router.post('/trigger-job', auth, async (req, res, next) => {
    try {
        const { runDailyJob } = require('../services/scheduler');
        await runDailyJob();
        res.json({
            success: true,
            message: 'Daily job triggered successfully'
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/analysis/django-status
// Check if Django AI engine is running
router.get('/django-status', auth, async (req, res, next) => {
    try {
        const aiClient = require('../services/aiEngineClient');
        const status = await aiClient.checkDjangoHealth();

        res.json({
            success: true,
            django: {
                online:  status.online,
                message: status.online
                    ? 'Django AI engine is running'
                    : 'Django AI engine is offline',
                error: status.error || null,
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;