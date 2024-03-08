.PHONY: start, crop
# Variables
URL = http://localhost:8000/crop
JSON_PAYLOAD = '{"rect":"[69 26 697 623]"}'

start:
	air

crop:
	@echo "Sending POST request to $(URL) with JSON payload: $(JSON_PAYLOAD)"
	@curl -X POST $(URL) -d $(JSON_PAYLOAD) -H "Content-Type: application/json"

