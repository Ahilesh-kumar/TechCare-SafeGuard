# mock_database.py
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.json")

def format_spec_to_str(spec) -> str:
    if isinstance(spec, str):
        return spec
    if isinstance(spec, dict):
        lines = []
        for k, v in spec.items():
            if isinstance(v, list):
                lines.append(f"{k}:")
                for item in v:
                    lines.append(f"  - {item}")
            else:
                lines.append(f"{k}: {v}")
        return "\n".join(lines)
    return str(spec)

class DynamicKnowledgeBase(dict):
    """
    A dictionary subclass that dynamically reads from database.json
    on every access to prevent Python caching issues during live updates.
    """
    def _load(self) -> dict:
        if os.path.exists(DB_PATH):
            try:
                with open(DB_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                cleaned = {}
                dirty = False
                for k, v in data.items():
                    if not isinstance(v, str):
                        cleaned[k] = format_spec_to_str(v)
                        dirty = True
                    else:
                        cleaned[k] = v
                if dirty:
                    self._save(cleaned)
                return cleaned
            except Exception as e:
                print(f"Error loading database.json: {e}")
        return {}

    def _save(self, data: dict) -> None:
        try:
            with open(DB_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving database.json: {e}")

    def get(self, key, default=None):
        return self._load().get(key, default)

    def __getitem__(self, key):
        return self._load()[key]

    def __contains__(self, key):
        return key in self._load()

    def items(self):
        return self._load().items()

    def keys(self):
        return self._load().keys()

    def values(self):
        return self._load().values()

    def __len__(self):
        return len(self._load())

    def update_spec(self, name: str, spec) -> None:
        data = self._load()
        data[name] = format_spec_to_str(spec)
        self._save(data)

    def delete_spec(self, name: str) -> None:
        data = self._load()
        if name in data:
            del data[name]
            self._save(data)

ENTERPRISE_KNOWLEDGE_BASE = DynamicKnowledgeBase()
