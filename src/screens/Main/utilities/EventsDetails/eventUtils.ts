import axios from "axios";
import { ConversationContext, EventInfo, persistentEventInfo } from "../../types/types";
import { useRef, useState } from "react";
import { conversation, eventInfo } from "../../states/initialStates";

export const EventUtils = () => {
    const persistentEventInfoRef = useRef<persistentEventInfo>(eventInfo);
    const [conversationContext, setConversationContext] = useState<ConversationContext>(conversation);
    const OPENAI_API_KEY = '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';

    const parseEventDetails = async (input: string): Promise<EventInfo> => {
        // Update the full conversation text
        const updatedFullText = conversationContext.fullText + " " + input;

        // Update conversation context with the new input
        setConversationContext(prev => ({
            ...prev,
            fullText: updatedFullText,
            processedInputs: [...prev.processedInputs, input]
        }));

        // Make sure we're using the persistent reference values
        const currentEventInfo = {
            title: persistentEventInfoRef.current.title || conversationContext.title,
            date: persistentEventInfoRef.current.date || conversationContext.date,
            time: persistentEventInfoRef.current.time || conversationContext.time,
            timePeriod: persistentEventInfoRef.current.timePeriod || conversationContext.timePeriod
        };

        // Context for the AI to understand what we're looking for
        const context = `
        You are an event parser. Extract calendar event information from conversation.
        
        Current conversation: "${updatedFullText}"
        
        What we already know:
        - Title: ${currentEventInfo.title || "None"}
        - Date: ${currentEventInfo.date ? currentEventInfo.date.toDateString() : "None"}
        - Time: ${currentEventInfo.time || "None"}
        - Time Period: ${currentEventInfo.timePeriod || "None"}
        
        Today's date is ${new Date().toDateString()}.
        If the user mentions "tomorrow", interpret it relative to today.
        If the user mentions a day of week without a date, interpret it as the next occurrence.
        
        CRITICAL TIME HANDLING INSTRUCTIONS:
        1. Do NOT convert PM times to AM. Keep exactly as stated by user.
        2. If user says "3pm" or "3 PM", keep it as PM.
        3. If user says a number only (e.g., "3", "4", "5", "6") without AM/PM:
           Do NOT assume a time.
           Instead, ask the user to clarify: "Please provide the time with AM or PM (e.g., 3 PM)."
        4. If user mentions general periods like "morning", "afternoon", "evening", 
           mark these as timePeriod but DO NOT assign a specific time.
        5. Only assign a specific time if the user explicitly states an exact time.
        6. If free slot not available then user say time again then if user say in like "3pm" or "6pm"
            like in PM then take it as pm not am. 
        7. If the user types “PM” or “pm”, **trust the user’s input.** Never override with AM.
        
        ONLY extract information from the MOST RECENT user input: "${input}"
        DO NOT consider previously parsed information as part of this analysis.
        
        Return a JSON object with these fields:
        {
            "title": "extracted event title if found in this input, null if not",
            "date": "ISO date string if date found in this input, null if not",
            "time": "extracted time if found in this input (e.g. '3:00 PM'), null if not",
            "timePeriod": "morning/afternoon/evening if mentioned without specific time, null otherwise",
            "hasGeneralTimeOnly": boolean indicating if user only mentioned a general time period,
            "isFreeSlotCheck": boolean,
            "containsTitle": boolean indicating if THIS input contains title information,
            "containsDate": boolean indicating if THIS input contains date information,
            "containsTime": boolean indicating if THIS input contains time information
        }
        
        Only extract information present in the CURRENT input. Don't include information from previous exchanges.
    `;

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: context }, { role: "user", content: "Parse this input." }],
                    temperature: 0.2,
                    max_tokens: 300,
                },
                { headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
            );

            const responseText = response.data.choices[0].message.content.trim();
            console.log("AI Parser Response:", responseText);

            // Find JSON in response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid response format");

            const result = JSON.parse(jsonMatch[0]);

            // Process date if present in this input
            let eventDate = currentEventInfo.date;
            if (result.containsDate && result.date) {
                try {
                    const newDate = new Date(result.date);
                    if (!isNaN(newDate.getTime())) {
                        eventDate = newDate;
                    }
                } catch (e) {
                    console.error("Failed to parse date", e);
                }
            }

            // Important: Only process time if we have an EXACT time (not just a period)
            // and don't already have time information
            // Replace the existing time parsing block with this:
            if (eventDate && result.containsTime && result.time && !result.hasGeneralTimeOnly) {
                try {
                    // Enhanced regex to capture various time formats
                    const timeMatch = result.time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm|A\.M\.|P\.M\.|a\.m\.|p\.m\.)?/i);
                    if (timeMatch) {
                        let [_, hours, minutes, period] = timeMatch;
                        hours = parseInt(hours, 10);
                        minutes = minutes ? parseInt(minutes, 10) : 0;

                        // Reset time components to avoid any carryover
                        eventDate.setHours(0, 0, 0, 0);

                        // Handle AM/PM explicitly based on user input
                        const isPM = period && /pm|p\.m\./i.test(period);
                        const isAM = period && /am|a\.m\./i.test(period);

                        // Respect the user's explicit AM/PM designation
                        if (isPM && hours < 12) {
                            hours += 12;  // Convert to 24-hour format for PM
                        } else if (isAM && hours === 12) {
                            hours = 0;    // Midnight case
                        } else if (!period && hours >= 1 && hours <= 7) {
                            // Default 1-7 to PM only if no period specified
                            hours += 12;
                        }

                        // Set the hours and minutes
                        eventDate.setHours(hours, minutes, 0, 0);

                        // Debug logging
                        console.log("Time set:", {
                            input: result.time,
                            isPM,
                            isAM,
                            hours,
                            minutes,
                            resultDateUTC: eventDate.toISOString(),
                            resultDateLocal: eventDate.toLocaleString(),
                            hours24: eventDate.getHours()
                        });
                    } else {
                        throw new Error("Invalid time format");
                    }
                } catch (e) {
                    console.error("Failed to parse time:", e);
                }

            }

            // Merge with persistent information
            const newTitle = result.containsTitle && result.title ? result.title : currentEventInfo.title;
            const newTimePeriod = result.timePeriod || currentEventInfo.timePeriod;

            // Track if we have a general time period but need exact time
            const needsExactTime = (!!newTimePeriod && !result.time) || (result.hasGeneralTimeOnly === true);

            // Update persistent reference
            persistentEventInfoRef.current = {
                title: newTitle || persistentEventInfoRef.current.title,
                date: eventDate || persistentEventInfoRef.current.date,
                time: result.containsTime && result.time && !result.hasGeneralTimeOnly ? result.time : persistentEventInfoRef.current.time,
                timePeriod: newTimePeriod
            };

            // Update conversation context
            setConversationContext(prev => ({
                ...prev,
                title: newTitle || prev.title,
                date: eventDate || prev.date,
                time: result.containsTime && result.time && !result.hasGeneralTimeOnly ? result.time : prev.time,
                timePeriod: newTimePeriod,
                needsTitle: !newTitle,
                needsDate: !eventDate,
                needsTime: !prev.time && (!result.time || result.hasGeneralTimeOnly),
                needsExactTime: needsExactTime
            }));

            // Construct and return event info
            const eventInfo: EventInfo = {
                title: persistentEventInfoRef.current.title,
                date: persistentEventInfoRef.current.date,
                time: persistentEventInfoRef.current.time,
                hasGeneralTimeOnly: result.hasGeneralTimeOnly || false,
                timePeriod: newTimePeriod,
                // Keep track of what was found in THIS input
                isFreeSlotCheck: result.isFreeSlotCheck || false,
                containsTitle: result.containsTitle || false,
                containsDate: result.containsDate || false,
                containsTime: result.containsTime || false
            };

            console.log("Parsed Event Info:", eventInfo);
            return eventInfo;

        } catch (error) {
            console.error("Error parsing event details:", error);
            // Return existing persistent context on error
            return {
                title: persistentEventInfoRef.current.title,
                date: persistentEventInfoRef.current.date,
                time: persistentEventInfoRef.current.time,
                hasGeneralTimeOnly: false,
                timePeriod: persistentEventInfoRef.current.timePeriod,
                isFreeSlotCheck: false,
                containsTitle: false,
                containsDate: false,
                containsTime: false
            };
        }
    };

    const determineNextQuestion = async (eventInfo: EventInfo) => {
        const { title, date, time, timePeriod, hasGeneralTimeOnly, isFreeSlotCheck } = eventInfo;

        // If checking free slots, no need for more event information
        if (isFreeSlotCheck) return null;

        // Determine what information we still need
        const needsTitle = !title;
        const needsDate = !date;
        // This is where the bug is - we need to check if we have a specific time, not just if date exists
        const needsTime = !time && date && (!date.getHours() || hasGeneralTimeOnly);

        // Update our tracking of what we need to ask
        setConversationContext(prev => ({
            ...prev,
            needsTitle,
            needsDate,
            needsTime,
            needsExactTime: hasGeneralTimeOnly || !!timePeriod
        }));

        // Determine what we should ask for next based on what we're missing
        let nextField = "";

        if (needsTitle) {
            nextField = "title";
        } else if (needsDate) {
            nextField = "date";
        } else if (needsTime) {
            nextField = "time";
        }

        // If we have both title and date but no time, always ask for time next
        if (title && date && !time) {
            nextField = "time";
        }

        // Don't repeat the last question if possible
        if (nextField === conversationContext.lastAskedFor &&
            conversationContext.processedInputs.length > 1) {
            if (nextField === "title") {
                nextField = date ? "time" : "date";
            } else if (nextField === "date") {
                nextField = title ? "title" : "time";
            } else if (nextField === "time") {
                nextField = needsTitle ? "title" : "date";
            }
        }

        // Generate the appropriate question
        let question = "";

        if (nextField === "title") {
            question = "What would you like to name this event?";
            setConversationContext(prev => ({ ...prev, lastAskedFor: "title" }));
        } else if (nextField === "date") {
            question = title
                ? `When would you like to schedule "${title}"?`
                : "What date would you like to schedule this event?";
            setConversationContext(prev => ({ ...prev, lastAskedFor: "date" }));
        } else if (nextField === "time") {
            // If we have a general time period but need specific time
            if (timePeriod) {
                question = title
                    ? `What specific time in the ${timePeriod} would you like to schedule "${title}" on ${date.toDateString()}?`
                    : `What exact time in the ${timePeriod} would you like for the event on ${date.toDateString()}?`;
            } else {
                question = title
                    ? `What time would you like to schedule "${title}" on ${date.toDateString()}?`
                    : `What time would you like for the event on ${date.toDateString()}?`;
            }
            setConversationContext(prev => ({ ...prev, lastAskedFor: "time" }));
        } else if (title && date) {
            // Fallback: if we have title and date but somehow didn't set nextField to time
            question = `What time would you like to schedule "${title}" on ${date.toDateString()}?`;
            setConversationContext(prev => ({ ...prev, lastAskedFor: "time" }));
        } else {
            // We have everything we need
            return null;
        }

        return question;
    };

    return { parseEventDetails, determineNextQuestion }
}
