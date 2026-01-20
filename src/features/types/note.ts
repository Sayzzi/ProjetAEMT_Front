export default interface Note {

    id?: number,
    id_user: number,
    id_folder: number,
    title?: string | null,
    content?: string | null,
    created_at?: string,
    updated_at?: string,
    size_bytes?: number,
    line_count?: number,
    word_count?: number,
    char_count?: number

}
