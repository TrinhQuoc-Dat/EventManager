from sentence_transformers import SentenceTransformer, util
# import os
# import django
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EventApi.settings')
# django.setup()
from AppEvent import dao
model = SentenceTransformer('all-MiniLM-L6-v2')


def get_event_embeddings(query=None):
    if query is not None:
        events = dao.get_events()
        event_list = [{"id": e.id, "title": e.title} for e in events]
        event_title = [e.title for e in events]
        event_embeddings = model.encode(event_title, convert_to_tensor=True)
        query_embedding = model.encode(query, convert_to_tensor=True)

        # Tính độ tương đồng
        cosine_scores = util.cos_sim(query_embedding, event_embeddings)

        # Trả về top sự kiện
        top_results = cosine_scores[0].topk(3)
        suggestions = []
        for idx, score in zip(top_results.indices, top_results.values):
            event = event_list[int(idx)]
            suggestions.append({
                "id": event["id"],
                "title": event["title"],
                "score": round(float(score), 3)
            })
        return suggestions


# if __name__ == "__main__":
#     print(get_event_embeddings(query="Anh trai"))