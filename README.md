# placemark

전국 곳곳의 카페와 공간을 기록하는 개인 장소 아카이브입니다.

`placemark`는 제가 다녀온 곳, 앞으로 가보고 싶은 곳, 그리고 계속
기억해두고 싶은 장소를 정리하기 위한 오픈 소스 HTML 프로젝트입니다.
처음에는 카페 중심으로 시작하지만, 빵집, 서점, 식당, 전시 공간, 체인
지점처럼 더 넓은 범위의 장소까지 자연스럽게 확장할 수 있도록 구성했습니다.

## 이 레포지토리의 방향

- 프레임워크 없이 `HTML`, `CSS`, `JavaScript`만으로 만든 가벼운 구조
- 장소 데이터는 `data/places.json`에서 관리
- 전체 화면 지도 중심의 아주 단순한 시각적 아카이브
- GitHub Pages 같은 정적 호스팅에 바로 올릴 수 있는 형태
- 다른 사람이 레포를 열어봐도 구조와 데이터 형식을 바로 이해할 수 있는 형태

## 프로젝트 구조

```text
.
├── app.js
├── data
│   └── places.json
├── index.html
├── README.md
└── styles.css
```

## 데이터 구조

장소 데이터는 [`data/places.json`](/Users/newkimjiwon/project/placemark/data/places.json:1)에
들어 있습니다.

```json
{
  "id": "seoul-anthracite-hapjeong",
  "name": "Anthracite Hapjeong",
  "category": "cafe",
  "status": "visited",
  "region": "Seoul",
  "district": "Mapo-gu",
  "address": "357-6 Seogyo-dong, Mapo-gu, Seoul",
  "lat": 37.5507,
  "lng": 126.9144,
  "notes": "Roastery-style cafe with strong atmosphere.",
  "tags": ["coffee", "roastery", "favorite"],
  "visitedOn": "2025-11-02",
  "rating": 4.7
}
```

권장 규칙:

- `status`: `visited` 또는 `planned`
- `category`: `cafe`, `bakery`, `bookstore`, `restaurant`처럼 짧고 재사용 가능한 값
- `tags`: 분위기, 특징, 체인 여부 등을 짧게 기록
- `visitedOn`: 아직 안 간 곳은 `null`

## 장소 추가 방법

1. [`data/places.json`](/Users/newkimjiwon/project/placemark/data/places.json:1)을 엽니다.
2. `places` 배열에 새 객체를 추가합니다.
3. 필요하면 `category`, `region`, `tags`를 함께 정리합니다.

예시:

```json
{
  "id": "daejeon-sample-place",
  "name": "Sample Place",
  "category": "cafe",
  "status": "planned",
  "region": "Daejeon",
  "district": "Yuseong-gu",
  "address": "123 Example-ro, Yuseong-gu, Daejeon",
  "lat": 36.3622,
  "lng": 127.3568,
  "notes": "Known for quiet seating and good desserts.",
  "tags": ["dessert", "work-friendly"],
  "visitedOn": null,
  "rating": null
}
```

## GitHub Pages로 보기

이 프로젝트는 정적 파일만으로 동작하므로 GitHub Pages에 그대로 올려도 됩니다.
`index.html`, `app.js`, `styles.css`, `data/places.json`을 브라우저가 그대로 읽는 구조입니다.

1. 이 레포지토리를 GitHub에 푸시합니다.
2. GitHub 저장소의 `Settings` -> `Pages`로 이동합니다.
3. `Deploy from a branch`를 선택합니다.
4. `main` 브랜치와 `/ (root)` 폴더를 선택합니다.
5. 저장 후 생성된 Pages 주소로 접속합니다.

중요한 점:

- 로컬에서 `index.html`을 더블클릭해서 열면 `fetch("./data/places.json")`가 막힐 수 있습니다.
- 하지만 GitHub Pages처럼 웹 주소(`https://...`)로 열리면 정상 동작합니다.

## 로컬에서 보기

이 프로젝트는 `fetch`로 JSON을 읽기 때문에 `index.html`을 직접 더블클릭하는
방식보다 간단한 로컬 서버로 여는 편이 좋습니다.

```bash
python3 -m http.server 4173
```

그 다음 `http://localhost:4173`에서 확인할 수 있습니다.

## 오픈 소스 메모

- 이 레포지토리는 개인 기록이면서 동시에 공개 가능한 정적 HTML 프로젝트를 지향합니다.
- 누구나 코드와 데이터 형식을 참고해서 자기만의 장소 아카이브로 바꿔 쓸 수 있습니다.
- 서버나 데이터베이스 없이도 GitHub Pages에서 충분히 동작합니다.

## 다음에 확장할 수 있는 것들

- 장소별 상세 페이지 추가
- CSV에서 `places.json` 자동 생성
- 사진, 링크, 메모 필드 확장
- 도시별 또는 카테고리별 데이터 분리
- 방문 기록 타임라인 추가
