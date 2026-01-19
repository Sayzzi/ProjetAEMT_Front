// Classe pour gérer les erreurs API

export class ApiError extends Error {
    public status: number;
    public detail: string;

    constructor(status: number, title: string, detail: string) {
        super(`${title}: ${detail}`);
        this.status = status;
        this.detail = detail;
    }

    static async fromResponse(response: Response): Promise<ApiError> {
        const json = await response.json().catch(() => ({}));
        return new ApiError(
            response.status,
            json.title || 'Erreur',
            json.detail || json.message || 'Une erreur est survenue'
        );
    }
}
